import React, { useEffect, useState } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Home, Search, Library, User, Play, Pause, Heart, ListMusic, ChevronRight } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, Dimensions, Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { io, Socket } from 'socket.io-client';
import { searchSongs, MappedSong } from './src/lib/api';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const { width } = Dimensions.get('window');
const SOCKET_URL = "http://localhost:3001";
const userUid = "guest-123";

// ---- Shared State ----
let currentSong: MappedSong | null = null;
let isPlaying = false;
let soundRef: Audio.Sound | null = null;
let socket: Socket | null = null;

const listeners: (() => void)[] = [];
function subscribe(fn: () => void) { listeners.push(fn); return () => listeners.splice(listeners.indexOf(fn), 1); }
function notify() { listeners.forEach(fn => fn()); }

async function playSong(song: MappedSong, fromSync = false) {
  if (soundRef) { await soundRef.unloadAsync(); }
  currentSong = song;
  isPlaying = true;
  notify();
  if (!fromSync && socket) { socket.emit('playback-state', { userId: userUid, state: { currentSong: song, isPlaying: true } }); }
  try {
    const { sound } = await Audio.Sound.createAsync({ uri: song.url }, { shouldPlay: true });
    soundRef = sound;
  } catch (e) { console.error(e); }
}

async function togglePlay(fromSync = false) {
  if (!soundRef) return;
  if (isPlaying) { await soundRef.pauseAsync(); } else { await soundRef.playAsync(); }
  isPlaying = !isPlaying;
  notify();
  if (!fromSync && socket) { socket.emit('playback-state', { userId: userUid, state: { currentSong, isPlaying } }); }
}

function usePlayer() {
  const [, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick(t => t + 1)), []);
  return { currentSong, isPlaying, playSong, togglePlay };
}

// ---- Components ----
function MiniPlayer() {
  const { currentSong: song, isPlaying: playing, togglePlay: toggle } = usePlayer();
  if (!song) return null;
  return (
    <Pressable style={s.miniPlayer} onPress={toggle}>
      <Image source={{ uri: song.cover }} style={s.miniCover} />
      <View style={{ flex: 1 }}>
        <Text style={s.miniTitle} numberOfLines={1}>{song.title}</Text>
        <Text style={s.miniArtist} numberOfLines={1}>{song.artist}</Text>
      </View>
      <TouchableOpacity onPress={toggle} style={s.miniPlayBtn}>
        {playing ? <Pause color="white" size={20} /> : <Play color="white" size={20} fill="white" />}
      </TouchableOpacity>
    </Pressable>
  );
}

// ---- Screens ----
function HomeScreen() {
  const [sections, setSections] = useState<{ title: string; songs: MappedSong[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const SECTIONS = [
        { title: "Trending Now 🔥", query: "trending hindi hits" },
        { title: "Arijit Singh", query: "arijit singh top" },
        { title: "Global Top 50", query: "top 50 english" }
      ];
      const results = await Promise.all(SECTIONS.map(async s => ({ title: s.title, songs: await searchSongs(s.query, 8) })));
      setSections(results);
      setLoading(false);
    })();
  }, []);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
        <Text style={s.greeting}>Good Evening</Text>
        {loading ? <ActivityIndicator color="#1DB954" style={{ marginTop: 40 }} /> : (
          sections.map(section => (
            <View key={section.title} style={{ marginBottom: 24 }}>
              <Text style={s.sectionTitle}>{section.title}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {section.songs.map(song => (
                  <TouchableOpacity key={song.id} style={s.card} onPress={() => playSong(song)}>
                    <Image source={{ uri: song.cover }} style={s.cardImage} />
                    <Text style={s.cardTitle} numberOfLines={1}>{song.title}</Text>
                    <Text style={s.cardArtist} numberOfLines={1}>{song.artist}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ))
        )}
      </ScrollView>
      <MiniPlayer />
    </SafeAreaView>
  );
}

function LibraryScreen({ navigation }: any) {
  const playlists = [
    { id: 'liked', name: 'Liked Songs', count: 42, icon: Heart, colors: ['#4c1d95', '#2563eb'] },
    { id: 'fav', name: 'Chill Mix', count: 12, icon: ListMusic, colors: ['#1e1b4b', '#4338ca'] },
    { id: 'gym', name: 'Gym Hits', count: 28, icon: ListMusic, colors: ['#450a0a', '#b91c1c'] },
  ];

  return (
    <SafeAreaView style={s.container}>
       <View style={{ padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={s.greeting}>Your Library</Text>
          <TouchableOpacity style={{ backgroundColor: '#1DB954', padding: 8, borderRadius: 20 }}>
             <ListMusic color="black" size={20} />
          </TouchableOpacity>
       </View>
       <ScrollView style={{ paddingHorizontal: 20 }}>
          {playlists.map(p => (
            <TouchableOpacity key={p.id} style={s.playlistRow} onPress={() => navigation.navigate('PlaylistDetail', { p })}>
               <View style={[s.playlistThumb, { backgroundColor: p.colors[0] }]}>
                  <p.icon color="white" size={24} fill={p.id === 'liked' ? 'white' : 'transparent'} />
               </View>
               <View style={{ flex: 1 }}>
                  <Text style={s.playlistName}>{p.name}</Text>
                  <Text style={s.playlistInfo}>Playlist • {p.count} songs</Text>
               </View>
               <ChevronRight color="#71717a" size={18} />
            </TouchableOpacity>
          ))}
       </ScrollView>
       <MiniPlayer />
    </SafeAreaView>
  );
}

function PlaylistDetailScreen({ route, navigation }: any) {
   const { p } = route.params;
   return (
     <SafeAreaView style={s.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
           <View style={[s.playlistHeader, { backgroundColor: p.colors[0] }]}>
              <View style={s.playlistLargeThumb}>
                 <p.icon color="white" size={64} fill={p.id === 'liked' ? 'white' : 'transparent'} />
              </View>
              <Text style={s.playlistHeaderTitle}>{p.name}</Text>
              <Text style={s.playlistHeaderSub}>Guest-123 • {p.count} songs</Text>
           </View>
           <View style={{ padding: 20 }}>
              <TouchableOpacity style={s.playBtnLarge} onPress={() => {}}>
                  <Play color="black" size={32} fill="black" />
              </TouchableOpacity>
              <Text style={{ color: '#71717a', fontSize: 13, marginTop: 20 }}>All songs are synced from your backend store.</Text>
           </View>
        </ScrollView>
        <MiniPlayer />
     </SafeAreaView>
   );
}

// ---- Main App ----
export default function App() {
  useEffect(() => {
    Audio.setAudioModeAsync({ staysActiveInBackground: true, playsInSilentModeIOS: true });
    socket = io(SOCKET_URL);
    socket.emit('join-room', userUid);
    socket.on('playback-update', (state) => {
      if (currentSong?.id !== state.currentSong.id) playSong(state.currentSong, true);
      else if (isPlaying !== state.isPlaying) togglePlay(true);
    });
    return () => { socket?.disconnect(); };
  }, []);

  return (
    <NavigationContainer theme={DarkTheme}>
       <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={TabNav} />
          <Stack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} />
       </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

function TabNav() {
   return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#1DB954',
          tabBarInactiveTintColor: '#71717a',
          tabBarStyle: { backgroundColor: '#000', borderTopWidth: 0, height: 75, paddingBottom: 15 },
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'Home') return <Home color={color} size={size} />;
            if (route.name === 'Search') return <Search color={color} size={size} />;
            if (route.name === 'Library') return <Library color={color} size={size} />;
            if (route.name === 'Profile') return <User color={color} size={size} />;
            return null;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Search" component={() => <SafeAreaView style={s.container}><Text style={{ color: 'white', padding: 20 }}>Search active</Text></SafeAreaView>} />
        <Tab.Screen name="Library" component={LibraryScreen} />
        <Tab.Screen name="Profile" component={() => <SafeAreaView style={s.container}><Text style={{ color: 'white', padding: 20 }}>Guest Profile</Text></SafeAreaView>} />
      </Tab.Navigator>
   );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  greeting: { fontSize: 26, fontWeight: '900', color: '#fff' },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 16 },
  card: { marginRight: 16, width: 150 },
  cardImage: { width: 150, height: 150, borderRadius: 12, marginBottom: 10 },
  cardTitle: { color: '#fff', fontWeight: '700', fontSize: 13 },
  cardArtist: { color: '#a1a1aa', fontSize: 11 },
  playlistRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  playlistThumb: { width: 56, height: 56, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  playlistName: { color: '#fff', fontSize: 15, fontWeight: '700' },
  playlistInfo: { color: '#71717a', fontSize: 12 },
  miniPlayer: {
    position: 'absolute', bottom: 85, left: 10, right: 10,
    backgroundColor: '#1c1c1e', borderRadius: 12, padding: 10,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: '#333'
  },
  miniCover: { width: 45, height: 45, borderRadius: 8 },
  miniTitle: { color: '#fff', fontSize: 13, fontWeight: '700' },
  miniArtist: { color: '#a1a1aa', fontSize: 11 },
  miniPlayBtn: { padding: 10 },
  playlistHeader: { padding: 40, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  playlistLargeThumb: { width: 150, height: 150, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 20, alignItems: 'center', justifyContent: 'center' },
  playlistHeaderTitle: { color: 'white', fontSize: 32, fontWeight: '900', marginTop: 20 },
  playlistHeaderSub: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '700', marginTop: 8 },
  playBtnLarge: { alignSelf: 'center', backgroundColor: '#1DB954', width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginTop: -32, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10 }
});
