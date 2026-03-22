import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, ScrollView, Alert, TextInput, Modal, FlatList } from 'react-native';
import { Heart, Plus, ListMusic, ListCollapse, X, ChevronRight, Music } from 'lucide-react-native';
import { useUserStore } from '../../store/useUserStore';
import { UserAPI, MappedSong, Playlist } from '../../lib/api';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

type FilterType = 'all' | 'playlists' | 'artists' | 'liked';

export const LibraryScreen: React.FC = () => {
  const [liked, setLiked] = useState<MappedSong[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const { userId, user } = useUserStore();
  const { setCurrentSong } = usePlayerStore();
  const navigation = useNavigation<any>();

  const fetchLibrary = useCallback(async () => {
    const [likedSongs, userPlaylists] = await Promise.all([
      UserAPI.getLikedSongs(userId),
      UserAPI.getPlaylists(userId)
    ]);
    setLiked(likedSongs || []);
    setPlaylists(userPlaylists || []);
  }, [userId]);

  useFocusEffect(useCallback(() => {
    fetchLibrary();
  }, [fetchLibrary]));

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      Alert.alert("Error", "Playlist name cannot be empty");
      return;
    }
    await UserAPI.createPlaylist(userId, newPlaylistName.trim());
    setNewPlaylistName('');
    setShowCreateModal(false);
    fetchLibrary();
    Alert.alert("Created", `Playlist "${newPlaylistName}" has been created!`);
  };

  const handleDeletePlaylist = (playlist: Playlist) => {
    Alert.alert("Delete Playlist", `Delete "${playlist.name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        await UserAPI.deletePlaylist(userId, playlist.id);
        fetchLibrary();
      }}
    ]);
  };

  const getFilteredItems = () => {
    switch (activeFilter) {
      case 'liked': return [];
      case 'playlists': return playlists;
      case 'artists': return [];
      default: return playlists;
    }
  };

  const uniqueArtists = [...new Set(liked.map(s => s.artist.split(/[,&]/)[0].trim()))].slice(0, 10);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image source={{ uri: user?.photo || "https://ui-avatars.com/api/?name=U&background=1DB954&color=fff" }} style={styles.avatar} />
          </TouchableOpacity>
          <Text style={styles.title}>Your Library</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => setShowCreateModal(true)}>
              <Plus color="#fff" size={28} style={{ marginRight: 20 }} />
            </TouchableOpacity>
          </View>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsContainer}>
          {(['all', 'playlists', 'artists', 'liked'] as FilterType[]).map(filter => (
            <TouchableOpacity 
              key={filter} 
              style={[styles.pill, activeFilter === filter && styles.pillActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={activeFilter === filter ? styles.pillTextActive : styles.pillText}>
                {filter === 'all' ? 'All' : filter === 'liked' ? 'Liked' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
        {/* Liked Songs - always shown unless filtered to playlists/artists only */}
        {(activeFilter === 'all' || activeFilter === 'liked') && (
          <TouchableOpacity 
            style={styles.libRow} 
            onPress={() => navigation.navigate('PlaylistDetail', { 
              p: { name: 'Liked Songs', count: liked.length, songs: liked } 
            })}
          >
            <LinearGradient colors={['#450aef', '#8e8eef']} style={styles.likedBox}>
              <Heart color="white" size={28} fill="white" />
            </LinearGradient>
            <View style={styles.libInfoCont}>
              <Text style={styles.libName}>Liked Songs</Text>
              <Text style={styles.libInfo}>Playlist • {liked.length} songs</Text>
            </View>
            <ChevronRight color="#555" size={20} />
          </TouchableOpacity>
        )}

        {/* User Playlists */}
        {(activeFilter === 'all' || activeFilter === 'playlists') && playlists.map(playlist => (
          <TouchableOpacity 
            key={playlist.id} 
            style={styles.libRow}
            onPress={() => navigation.navigate('PlaylistDetail', { 
              p: { name: playlist.name, count: playlist.songs?.length || 0, songs: playlist.songs || [], id: playlist.id }
            })}
            onLongPress={() => handleDeletePlaylist(playlist)}
          >
            <View style={styles.playlistIcon}>
              <ListMusic color="#1DB954" size={28} />
            </View>
            <View style={styles.libInfoCont}>
              <Text style={styles.libName}>{playlist.name}</Text>
              <Text style={styles.libInfo}>Playlist • {playlist.songs?.length || 0} songs</Text>
            </View>
            <ChevronRight color="#555" size={20} />
          </TouchableOpacity>
        ))}

        {/* Artists from liked songs */}
        {(activeFilter === 'all' || activeFilter === 'artists') && uniqueArtists.map(artist => (
          <TouchableOpacity 
            key={artist} 
            style={styles.libRow}
            onPress={() => navigation.navigate('ArtistDetail', { artist })}
          >
            <View style={styles.artistAvatar}>
              <Music color="#1DB954" size={24} />
            </View>
            <View style={styles.libInfoCont}>
              <Text style={styles.libName}>{artist}</Text>
              <Text style={styles.libInfo}>Artist</Text>
            </View>
            <ChevronRight color="#555" size={20} />
          </TouchableOpacity>
        ))}

        {/* Empty State */}
        {playlists.length === 0 && liked.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Your library is empty</Text>
            <Text style={styles.emptySubtext}>Start by liking songs or creating playlists</Text>
            <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('Search')}>
              <Text style={styles.browseBtnText}>Explore songs</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Create Playlist Modal */}
      <Modal visible={showCreateModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Playlist</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}><X color="white" size={24} /></TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="Playlist name"
              placeholderTextColor="#71717a"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
            />
            <TouchableOpacity style={styles.modalCreateBtn} onPress={handleCreatePlaylist}>
              <Text style={styles.modalCreateText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { paddingHorizontal: 16, paddingTop: 70, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#121212' },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 15 },
  title: { color: 'white', fontSize: 24, fontWeight: '900', flex: 1 },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  pillsContainer: { flexDirection: 'row', marginBottom: 5 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1c1c1e', marginRight: 10, borderWidth: 1, borderColor: '#333' },
  pillActive: { backgroundColor: '#1DB954', borderColor: '#1DB954' },
  pillText: { color: 'white', fontSize: 13, fontWeight: '600' },
  pillTextActive: { color: 'black', fontSize: 13, fontWeight: '700' },
  libRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  likedBox: { width: 64, height: 64, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  playlistIcon: { width: 64, height: 64, borderRadius: 4, backgroundColor: '#282828', alignItems: 'center', justifyContent: 'center' },
  artistAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#282828', alignItems: 'center', justifyContent: 'center' },
  libInfoCont: { marginLeft: 15, flex: 1 },
  libName: { color: 'white', fontSize: 16, fontWeight: '700' },
  libInfo: { color: '#a1a1aa', fontSize: 13, marginTop: 2 },
  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
  emptyText: { color: 'white', fontSize: 20, fontWeight: '800', textAlign: 'center' },
  emptySubtext: { color: '#71717a', fontSize: 14, textAlign: 'center', marginTop: 10, marginBottom: 25 },
  browseBtn: { backgroundColor: 'white', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 25 },
  browseBtnText: { color: 'black', fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#282828', borderRadius: 16, padding: 25, width: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { color: 'white', fontSize: 22, fontWeight: '900' },
  modalInput: { backgroundColor: '#333', color: 'white', fontSize: 16, padding: 15, borderRadius: 8, marginBottom: 20 },
  modalCreateBtn: { backgroundColor: '#1DB954', paddingVertical: 14, borderRadius: 25, alignItems: 'center' },
  modalCreateText: { color: 'black', fontSize: 16, fontWeight: '900' },
});
