import React, { useEffect } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';
import { Home as HomeIcon, Search as SearchIcon, Library, User } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { Audio } from 'expo-av';
import * as WebBrowser from 'expo-web-browser';

// Screens
import { HomeScreen } from './src/screens/Home/HomeScreen';
import { SearchScreen } from './src/screens/Search/SearchScreen';
import { LibraryScreen } from './src/screens/Library/LibraryScreen';
import { ProfileScreen } from './src/screens/Profile/ProfileScreen';
import { ArtistDetailScreen } from './src/screens/ArtistDetail/ArtistDetailScreen';
import { PlaylistDetailScreen } from './src/screens/PlaylistDetail/PlaylistDetailScreen';
import { SettingsScreen } from './src/screens/Settings/SettingsScreen';
import { AuthScreen } from './src/screens/Auth/AuthScreen';

// Components
import { MiniPlayer } from './src/components/MiniPlayer';

// Hooks and Store
import { useSocketSync } from './src/lib/useSocketSync';
import { useUserStore } from './src/store/useUserStore';

WebBrowser.maybeCompleteAuthSession();

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNav = () => (
  <Tab.Navigator 
    screenOptions={({ route }) => ({
      headerShown: false, 
      tabBarActiveTintColor: '#1DB954', 
      tabBarInactiveTintColor: '#71717a',
      tabBarStyle: { 
        backgroundColor: '#000', 
        borderTopWidth: 0, 
        height: 85, 
        paddingBottom: 25 
      },
      tabBarIcon: ({ color, size }) => {
        if (route.name === 'Home') return <HomeIcon color={color} size={size} />;
        if (route.name === 'Search') return <SearchIcon color={color} size={size} />;
        if (route.name === 'Library') return <Library color={color} size={size} />;
        if (route.name === 'Profile') return <User color={color} size={size} />;
        return null;
      }
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Search" component={SearchScreen} />
    <Tab.Screen name="Library" component={LibraryScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default function App() {
  const { user, loading, initialize } = useUserStore();
  useSocketSync();

  useEffect(() => {
    Audio.setAudioModeAsync({ staysActiveInBackground: true, playsInSilentModeIOS: true });
    initialize(); // Start Firebase auth listener
  }, []);

  // Show loading spinner while Firebase checks auth state
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <NavigationContainer theme={DarkTheme}>
         <View style={{ flex: 1 }}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
               {(!user || !user.profileComplete) ? (
                 // Not logged in or profile not completed -> show Auth screen
                 <Stack.Screen name="Auth" component={AuthScreen} />
               ) : (
                 // Logged in and completed -> show main app
                 <>
                   <Stack.Screen name="Main" component={TabNav} />
                   <Stack.Screen 
                     name="PlaylistDetail" 
                     component={PlaylistDetailScreen} 
                     options={{ presentation: 'modal' }}
                   />
                   <Stack.Screen 
                     name="ArtistDetail" 
                     component={ArtistDetailScreen} 
                   />
                   <Stack.Screen 
                     name="Settings" 
                     component={SettingsScreen} 
                   />
                 </>
               )}
            </Stack.Navigator>
            {(user && user.profileComplete) && <MiniPlayer />}
         </View>
      </NavigationContainer>
      <StatusBar style="light" />
    </View>
  );
}
