import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, SafeAreaView, ActivityIndicator, Dimensions } from 'react-native';
import { ChevronLeft, Play, Music, MoreVertical, CheckCircle2, Shuffle } from 'lucide-react-native';
import { usePlayerStore } from '../../store/usePlayerStore';
import { searchSongs, MappedSong } from '../../lib/api';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export const ArtistDetailScreen: React.FC<any> = ({ route, navigation }) => {
  const { artist } = route.params;
  const { setCurrentSong } = usePlayerStore();
  const [songs, setSongs] = useState<MappedSong[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtistSongs = async () => {
      const results = await searchSongs(artist, 30);
      setSongs(results);
      setLoading(false);
    };
    fetchArtistSongs();
  }, [artist]);

  return (
     <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#333', '#121212', '#000']} style={styles.headerBG} />
        <View style={styles.navBar}>
            <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft color="white" size={28} /></TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#1DB954" style={{ marginTop: 100 }} />
        ) : (
          <FlatList 
            data={songs} 
            keyExtractor={item => item.id} 
            contentContainerStyle={{ paddingBottom: 160 }}
            ListHeaderComponent={() => (
              <View style={styles.header}>
                <View style={styles.avatarCont}>
                   <Image source={{ uri: "https://ui-avatars.com/api/?name=" + artist + "&background=1DB954&color=fff&size=256" }} style={styles.avatarXl} />
                </View>
                <View style={styles.meta}>
                   <View style={styles.verifiedRow}>
                      <CheckCircle2 color="#1DB954" size={16} fill="white" />
                      <Text style={styles.verifiedText}>Verified Artist</Text>
                   </View>
                   <Text style={styles.title}>{artist}</Text>
                   <Text style={styles.monthly}>18,492,031 monthly listeners</Text>
                </View>

                <View style={styles.actionRow}>
                   <TouchableOpacity style={styles.followBtn}><Text style={styles.followText}>Following</Text></TouchableOpacity>
                   <TouchableOpacity><MoreVertical color="#a1a1aa" size={24} /></TouchableOpacity>
                   <View style={{ flex: 1 }} />
                   <TouchableOpacity style={styles.shuffleBtn}><Shuffle color="#a1a1aa" size={24} /></TouchableOpacity>
                   <TouchableOpacity 
                     style={styles.playFab} 
                     onPress={() => songs.length > 0 && setCurrentSong(songs[0], songs)}
                   >
                     <Play color="black" size={32} fill="black" />
                   </TouchableOpacity>
                </View>

                <Text style={styles.popularTitle}>Popular</Text>
              </View>
            )}
            renderItem={({ item, index }) => (
              <TouchableOpacity style={styles.row} onPress={() => setCurrentSong(item, songs)}>
                <Text style={styles.index}>{index + 1}</Text>
                <Image source={{ uri: item.cover }} style={styles.thumb} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.info}>{item.album}</Text>
                </View>
                <MoreVertical color="#a1a1aa" size={20} />
              </TouchableOpacity>
            )}
          />
        )}
     </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  headerBG: { position: 'absolute', top: 0, left: 0, right: 0, height: 350 },
  navBar: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 10, zIndex: 10 },
  header: { paddingHorizontal: 20, paddingTop: 10 },
  avatarCont: { alignItems: 'center', marginVertical: 10 },
  avatarXl: { width: 180, height: 180, borderRadius: 90, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20 },
  meta: { marginTop: 10 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  verifiedText: { color: 'white', fontSize: 13, fontWeight: '700' },
  title: { color: 'white', fontSize: 48, fontWeight: '900', marginTop: 5 },
  monthly: { color: '#a1a1aa', fontSize: 14, fontWeight: '700', marginTop: 5 },
  actionRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 25, gap: 20 },
  followBtn: { borderWidth: 1, borderColor: '#555', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  followText: { color: 'white', fontWeight: '700', fontSize: 13 },
  shuffleBtn: { marginRight: 10 },
  playFab: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#1DB954', alignItems: 'center', justifyContent: 'center' },
  popularTitle: { color: 'white', fontSize: 20, fontWeight: '900', marginVertical: 20 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 15, marginBottom: 20 },
  index: { color: '#a1a1aa', fontSize: 14, fontWeight: '700', width: 20 },
  thumb: { width: 48, height: 48, borderRadius: 4 },
  name: { color: '#fff', fontSize: 15, fontWeight: '700' },
  info: { color: '#71717a', fontSize: 12, marginTop: 2 }
});
