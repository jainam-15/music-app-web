import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, SafeAreaView, Dimensions, Animated, ScrollView } from 'react-native';
import { ChevronLeft, Play, MoreVertical, Search, Heart, Share2, Headphones } from 'lucide-react-native';
import { usePlayerStore } from '../../store/usePlayerStore';
import { searchSongs, MappedSong } from '../../lib/api';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export const PlaylistDetailScreen: React.FC<any> = ({ route, navigation }) => {
  const { p: playlist } = route.params;
  const { setCurrentSong, isPlaying, togglePlay, currentSong } = usePlayerStore();

  const handlePlayAll = () => {
    if (playlist.songs.length > 0) {
      setCurrentSong(playlist.songs[0], playlist.songs);
    }
  };

  return (
     <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#4c1d95', '#000000']} style={styles.headerBG} />
        <View style={styles.navBar}>
            <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft color="white" size={28} /></TouchableOpacity>
        </View>

        <FlatList 
          data={playlist.songs} 
          keyExtractor={item => item.id} 
          contentContainerStyle={{ paddingBottom: 160 }}
          ListHeaderComponent={() => (
            <View style={styles.libDetHead}>
              <View style={styles.searchRow}>
                 <View style={styles.searchIn}><Search color="#a1a1aa" size={16} /><Text style={styles.searchPlaceholder}>Find in playlist</Text></View>
                 <TouchableOpacity style={styles.sortBtn}><Text style={styles.sortText}>Sort</Text></TouchableOpacity>
              </View>

              <View style={styles.coverCont}>
                  <Image source={{ uri: playlist.songs[0]?.cover || "https://ui-avatars.com/api/?name=L&background=1DB954&color=fff" }} style={styles.libDetCover} />
              </View>
              
              <View style={styles.metaRow}>
                 <View style={{ flex: 1 }}>
                    <Text style={styles.libDetTitle}>{playlist.name}</Text>
                    <View style={styles.creatorRow}>
                       <View style={styles.avatarSm}><Text style={styles.avatarChar}>M</Text></View>
                       <Text style={styles.creatorName}>MusicApp User • {playlist.songs.length} songs</Text>
                    </View>
                 </View>
              </View>

              <View style={styles.actionRow}>
                  <View style={styles.leftActions}>
                     <TouchableOpacity><Heart color="#1DB954" size={24} fill="#1DB954" style={{ marginRight: 25 }} /></TouchableOpacity>
                     <TouchableOpacity><Share2 color="#a1a1aa" size={24} style={{ marginRight: 25 }} /></TouchableOpacity>
                     <TouchableOpacity><MoreVertical color="#a1a1aa" size={24} /></TouchableOpacity>
                  </View>
                  <TouchableOpacity style={styles.playFab} onPress={handlePlayAll}>
                     <Play color="black" size={32} fill="black" />
                  </TouchableOpacity>
              </View>
            </View>
          )}
          renderItem={({ item, index }) => (
            <TouchableOpacity style={styles.playlistRow} onPress={() => setCurrentSong(item, playlist.songs)}>
              <Image source={{ uri: item.cover }} style={styles.playlistThumb} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.playlistName, currentSong?.id === item.id && { color: '#1DB954' }]} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.playlistInfo}>{item.artist}</Text>
              </View>
              <MoreVertical color="#a1a1aa" size={20} />
            </TouchableOpacity>
          )}
        />
     </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  headerBG: { position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.4 },
  navBar: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 10, zIndex: 10 },
  libDetHead: { paddingHorizontal: 20, paddingTop: 0 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  searchIn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 4, gap: 10 },
  searchPlaceholder: { color: '#a1a1aa', fontSize: 13, fontWeight: '700' },
  sortBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 4 },
  sortText: { color: 'white', fontSize: 13, fontWeight: '700' },
  coverCont: { alignItems: 'center', marginVertical: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20 },
  libDetCover: { width: 220, height: 220, borderRadius: 4 },
  metaRow: { marginTop: 20 },
  libDetTitle: { color: 'white', fontSize: 24, fontWeight: '900' },
  creatorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 10 },
  avatarSm: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' },
  avatarChar: { color: 'white', fontSize: 12, fontWeight: '900' },
  creatorName: { color: '#a1a1aa', fontSize: 13, fontWeight: '700' },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 15, marginBottom: 10 },
  leftActions: { flexDirection: 'row', alignItems: 'center' },
  playFab: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#1DB954', alignItems: 'center', justifyContent: 'center' },
  playlistRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 15, marginVertical: 10 },
  playlistThumb: { width: 52, height: 52, borderRadius: 4 },
  playlistName: { color: 'white', fontSize: 15, fontWeight: '700' },
  playlistInfo: { color: '#a1a1aa', fontSize: 12, marginTop: 2 }
});
