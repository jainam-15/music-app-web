import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Sparkles, Mail, Lock, User, Calendar, ArrowRight, Chrome } from 'lucide-react-native';
import { auth } from '../../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as firebaseUpdateProfile,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { useUserStore } from '../../store/useUserStore';
import { UserAPI } from '../../lib/api';
import { LinearGradient } from 'expo-linear-gradient';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '405253103561-dicqt3daua3055bo3naa0h1i886lspti.apps.googleusercontent.com', 
});

type AuthMode = 'login' | 'register';
type RegStep = 'credentials' | 'details';

export const AuthScreen: React.FC<any> = ({ navigation }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [regStep, setRegStep] = useState<RegStep>('credentials');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');

  const { updateProfile, user } = useUserStore();

  useEffect(() => {
    // If Firebase logged us in but we don't have a backend profile yet
    if (user && !user.profileComplete) {
      setMode('register');
      setRegStep('details');
      if (user.name !== "User" && !name) {
        setName(user.name);
      }
    }
  }, [user]);

  // --- LOGIN ---
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged in useUserStore will handle the rest
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError("Account doesn't exist. Please register first.");
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("Invalid email or password.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else {
        setError(err.message?.replace("Firebase: ", "") || "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- REGISTER (step 1: email + password) ---
  const handleRegister = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Now move to details step
      setRegStep('details');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Try logging in.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password is too weak. Use at least 6 characters.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else {
        setError(err.message?.replace("Firebase: ", "") || "Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- REGISTER (step 2: name + dob) ---
  const handleFinishProfile = async () => {
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Update Firebase profile
      if (auth.currentUser) {
        await firebaseUpdateProfile(auth.currentUser, {
          displayName: name,
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1DB954&color=fff`
        });
      }
      // Sync to backend
      await updateProfile({ name, dob });
      // onAuthStateChanged will pick up the updated profile
    } catch (err: any) {
      setError(err.message || "Profile update failed.");
    } finally {
      setLoading(false);
    }
  };

  // --- GOOGLE SIGN-IN ---
  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      // userInfo.data.idToken is the correct path in newer versions, but we can fall back just in case
      const idToken = userInfo.data?.idToken || (userInfo as any).idToken;
      
      if (!idToken) throw new Error("No ID token found");
      
      setLoading(true);
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
      // Success! onAuthStateChanged in useUserStore will handle the rest
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation already in progress
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError("Google Play services not available or outdated");
      } else {
        setError(error.message || "Google Sign-In failed.");
      }
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setDob('');
    setError('');
    setRegStep('credentials');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1DB95420', '#000']} style={styles.gradient}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

            {/* Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logoBox}>
                <Sparkles color="black" size={40} />
              </View>
            </View>

            {/* --- LOGIN --- */}
            {mode === 'login' && (
              <View>
                <Text style={styles.heading}>Welcome Back</Text>
                <Text style={styles.subheading}>Sign in to your account</Text>

                {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

                <View style={styles.inputRow}>
                  <Mail color="#71717a" size={18} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email address"
                    placeholderTextColor="#71717a"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputRow}>
                  <Lock color="#71717a" size={18} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#71717a"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin} disabled={loading}>
                  {loading ? <ActivityIndicator color="black" /> : <Text style={styles.primaryBtnText}>Login</Text>}
                </TouchableOpacity>

                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSignIn}>
                  <Chrome color="black" size={22} />
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
                </TouchableOpacity>

                <View style={styles.switchRow}>
                  <Text style={styles.switchText}>Don't have an account?</Text>
                  <TouchableOpacity onPress={() => { setMode('register'); resetForm(); }}>
                    <Text style={styles.switchLink}>Register</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* --- REGISTER Step 1: Credentials --- */}
            {mode === 'register' && regStep === 'credentials' && (
              <View>
                <Text style={styles.heading}>Create Account</Text>
                <Text style={styles.subheading}>Join millions of music lovers</Text>

                {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

                <View style={styles.inputRow}>
                  <Mail color="#71717a" size={18} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email address"
                    placeholderTextColor="#71717a"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputRow}>
                  <Lock color="#71717a" size={18} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password (min 6 characters)"
                    placeholderTextColor="#71717a"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={handleRegister} disabled={loading}>
                  {loading ? <ActivityIndicator color="black" /> : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Text style={styles.primaryBtnText}>Continue</Text>
                      <ArrowRight color="black" size={20} />
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSignIn}>
                  <Chrome color="black" size={22} />
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
                </TouchableOpacity>

                <View style={styles.switchRow}>
                  <Text style={styles.switchText}>Already have an account?</Text>
                  <TouchableOpacity onPress={() => { setMode('login'); resetForm(); }}>
                    <Text style={styles.switchLink}>Login</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* --- REGISTER Step 2: Profile Details --- */}
            {mode === 'register' && regStep === 'details' && (
              <View>
                <Text style={styles.heading}>Almost There!</Text>
                <Text style={styles.subheading}>Tell us about yourself</Text>

                {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

                <Text style={styles.fieldLabel}>FULL NAME</Text>
                <View style={styles.inputRow}>
                  <User color="#71717a" size={18} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Your name"
                    placeholderTextColor="#71717a"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <Text style={styles.fieldLabel}>DATE OF BIRTH</Text>
                <View style={styles.inputRow}>
                  <Calendar color="#71717a" size={18} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#71717a"
                    value={dob}
                    onChangeText={setDob}
                    keyboardType="numeric"
                  />
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={handleFinishProfile} disabled={loading}>
                  {loading ? <ActivityIndicator color="black" /> : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Text style={styles.primaryBtnText}>Finish</Text>
                      <ArrowRight color="black" size={20} />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}

          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  gradient: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 30, paddingVertical: 50 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoBox: {
    width: 80, height: 80, borderRadius: 28,
    backgroundColor: '#1DB954',
    alignItems: 'center', justifyContent: 'center',
    transform: [{ rotate: '3deg' }],
    shadowColor: '#1DB954', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 25,
  },
  heading: { color: 'white', fontSize: 36, fontWeight: '900', textAlign: 'center', letterSpacing: -1 },
  subheading: { color: '#71717a', fontSize: 14, fontWeight: '700', textAlign: 'center', marginTop: 10, marginBottom: 30 },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', borderRadius: 16, padding: 15, marginBottom: 20 },
  errorText: { color: '#ef4444', fontSize: 12, fontWeight: '900', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldLabel: { color: '#71717a', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginLeft: 15, marginBottom: 8, marginTop: 5 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 20, paddingHorizontal: 15, marginBottom: 15, height: 56 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: 'white', fontSize: 15, fontWeight: '700' },
  primaryBtn: { backgroundColor: '#1DB954', paddingVertical: 18, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 10, shadowColor: '#1DB954', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 15 },
  primaryBtnText: { color: 'black', fontSize: 16, fontWeight: '900' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#333' },
  dividerText: { color: '#71717a', fontSize: 12, fontWeight: '700', marginHorizontal: 15 },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: 'white', paddingVertical: 18, borderRadius: 20, shadowColor: '#fff', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.05, shadowRadius: 15 },
  googleBtnText: { color: 'black', fontSize: 14, fontWeight: '900' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 6 },
  switchText: { color: '#71717a', fontSize: 13, fontWeight: '700' },
  switchLink: { color: '#1DB954', fontSize: 13, fontWeight: '900' },
});
