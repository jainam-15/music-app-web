import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, RefreshControl, ActivityIndicator, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { Headphones, Settings, Clock, History } from 'lucide-react-native';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useUserStore } from '../../store/useUserStore';
import { searchSongs, UserAPI, MappedSong } from '../../lib/api';
import { SongCard } from '../../components/SongCard';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export const HomeScreen: React.FC = () => {
  const [sections, setSections] = useState<{ title: string; songs: MappedSong[] }[]>([]);
  const [recentPlays, setRecentPlays] = useState<MappedSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { setCurrentSong } = usePlayerStore();
  const { user, userId } = useUserStore();
  const navigation = useNavigation<any>();

  const fetchData = useCallback(async () => {
    try {
      const recent = await UserAPI.getRecentPlays(userId);
      setRecentPlays(recent.slice(0, 6));

      if (sections.length === 0) {
        const SECTIONS = [
          { title: "Trending Melodies 🔥", query: "trending hindi hits" },
          { title: "Today's Hits", query: "top bollywood songs" },
          { title: "Discover New", query: "latest pop hits" }
        ];
        
        const saavnResults = await Promise.all(
          SECTIONS.map(async s => ({ 
            title: s.title, 
            songs: await searchSongs(s.query, 12) 
          }))
        );
        
        setSections(saavnResults);
      }
    } catch (e) {
      console.error("Home data fetch failed", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, sections.length]);

  useFocusEffect(useCallback(() => {
    fetchData();
  }, [fetchData]));

  const RecentItem = ({ song }: { song: MappedSong }) => (
    <TouchableOpacity style={styles.recentItem} onPress={() => setCurrentSong(song)}>
      <Image source={{ uri: song.cover }} style={styles.recentImage} />
      <Text style={styles.recentText} numberOfLines={2}>{song.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 160 }} 
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => { setRefreshing(true); fetchData(); }} 
            tintColor="#1DB954" 
          />
        }
      >
        <LinearGradient
          colors={['#1e3a89', '#000']}
          style={styles.gradientHeader}
        >
          <View style={styles.headerRow}>
             <Text style={styles.greeting}>{getGreeting()}, {user?.name?.split(' ')[0] || "Guest"}</Text>
             <View style={styles.headerIcons}>
               <TouchableOpacity onPress={() => Alert.alert("Coming Soon", "History feature is under development!")}>
                 <Clock color="white" size={26} style={{ marginRight: 20 }} />
               </TouchableOpacity>
               <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                 <Settings color="white" size={26} />
               </TouchableOpacity>
             </View>
          </View>

          {recentPlays.length > 0 && (
            <View style={styles.recentGrid}>
              {recentPlays.map((song, i) => (
                <RecentItem key={song.id + i} song={song} />
              ))}
            </View>
          )}
          <View style={styles.headerSeparator} />
        </LinearGradient>
        
        <View style={{ paddingHorizontal: 20 }}>
          {loading ? (
            <ActivityIndicator color="#1DB954" style={{ marginTop: 40 }} />
          ) : (
            sections.map(section => (
              <View key={section.title} style={{ marginBottom: 32 }}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {section.songs.map(song => (
                    <SongCard 
                      key={song.id + section.title} 
                      song={song} 
                      onPress={(s) => setCurrentSong(s, section.songs)} 
                    />
                  ))}
                </ScrollView>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  gradientHeader: { paddingHorizontal: 20, paddingTop: 70, paddingBottom: 0 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  greeting: { fontSize: 22, fontWeight: '900', color: '#fff' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  recentGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  recentItem: { 
    width: (width - 48) / 2, 
    backgroundColor: 'rgba(255,255,255,0.08)', 
    borderRadius: 6, 
    flexDirection: 'row', 
    alignItems: 'center',
    overflow: 'hidden',
    height: 56
  },
  recentImage: { width: 56, height: 56 },
  recentText: { color: 'white', fontSize: 13, fontWeight: '800', flex: 1, paddingHorizontal: 8 },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 16, marginTop: 4 },
  headerSeparator: { height: 1, backgroundColor: '#333', marginTop: 10, width: '100%' },
});
