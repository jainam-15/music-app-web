import { create } from 'zustand';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { UserAPI } from '../lib/api';

interface UserData {
  uid: string;
  email: string;
  name: string;
  photo: string;
  dob?: string;
  profileComplete?: boolean;
}

interface UserState {
  user: UserData | null;
  userId: string;
  loading: boolean;
  initialized: boolean;
  setUser: (user: UserData | null) => void;
  setUserId: (id: string) => void;
  initialize: () => void;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserData>) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  userId: "guest-123",
  loading: true,
  initialized: false,

  setUser: (user) => set({ 
    user, 
    userId: user ? user.uid : "guest-123" 
  }),

  setUserId: (userId) => set({ userId }),

  initialize: () => {
    if (get().initialized) return;
    set({ initialized: true }); // Mark as initialized so we don't attach multiple listeners
    
    // Safety fallback: if Firebase is stuck for 5 seconds, clear the loading screen
    setTimeout(() => {
      if (get().loading) {
        console.log("Firebase auth timeout! Fallback to guest.");
        set({ loading: false });
      }
    }, 5000);

    onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        let isComplete = false;
        let backendProfile: any = null;
        
        // Sync with backend before setting state to avoid flashes
        try {
          backendProfile = await UserAPI.syncUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || "User",
            photoURL: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.displayName || 'User')}&background=1DB954&color=fff`,
          });
          if (backendProfile && backendProfile.dob) {
            isComplete = true;
          }
        } catch (e) {
          console.error("Backend sync failed:", e);
        }

        const user: UserData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: backendProfile?.displayName || firebaseUser.displayName || "User",
          photo: backendProfile?.photoURL || firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.displayName || 'User')}&background=1DB954&color=fff`,
          dob: backendProfile?.dob,
          profileComplete: isComplete,
        };

        set({ user, userId: user.uid, loading: false, initialized: true });
      } else {
        set({ user: null, userId: "guest-123", loading: false, initialized: true });
      }
    });
  },

  logout: async () => {
    set({ loading: true });
    try {
      await signOut(auth);
      set({ user: null, userId: "guest-123", loading: false });
    } catch (error) {
      console.error("Logout failed:", error);
      set({ loading: false });
    }
  },

  updateProfile: async (data) => {
    const currentUser = get().user;
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...data, profileComplete: true };
    set({ user: updatedUser });
    try {
      await UserAPI.syncUser({
        uid: updatedUser.uid,
        email: updatedUser.email,
        displayName: updatedUser.name,
        photoURL: updatedUser.photo,
        dob: updatedUser.dob,
      });
    } catch (e) {
      console.error("Profile update sync failed:", e);
    }
  },
}));
