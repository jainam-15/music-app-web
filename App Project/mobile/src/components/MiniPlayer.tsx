import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Pressable, Modal, SafeAreaView, ScrollView, Dimensions, ActivityIndicator, Share, Alert } from 'react-native';
import { Play, Pause, X, Heart, Settings, Shuffle, SkipBack, SkipForward, Repeat1, Repeat, Headphones, Mic2, ListMusic, Share2, Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { usePlayerStore } from '../store/usePlayerStore';
import { useUserStore } from '../store/useUserStore';
import { UserAPI, MappedSong, Playlist, getLyrics } from '../lib/api';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export const MiniPlayer: React.FC = () => {
  const { 
    currentSong, isPlaying, togglePlay, progressMs, durationMs, 
    next, prev, seekTo, isShuffle, repeatMode, toggleShuffle, toggleRepeat,
    playbackQueue, queueIndex, setCurrentSong 
  } = usePlayerStore();
  const { userId } = useUserStore();
  const navigation = useNavigation<any>();
  const [showFull, setShowFull] = useState(false);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);

  // Check if current song is liked
  useEffect(() => {
    if (currentSong) {
      UserAPI.getLikedSongs(userId).then(songs => {
        setIsLiked(songs?.some(s => s.id === currentSong.id) || false);
      });
    }
  }, [currentSong?.id, userId]);

  // Fetch lyrics when full player opens
  useEffect(() => {
    if (showFull && currentSong) {
      setLoadingLyrics(true);
      getLyrics(currentSong.id).then(lyricStr => {
        setLyrics(lyricStr);
        setLoadingLyrics(false);
      });
    }
  }, [showFull, currentSong?.id]);

  const handleToggleLike = async () => {
    if (!currentSong) return;
    await UserAPI.toggleLike(userId, currentSong);
    setIsLiked(!isLiked);
  };

  const handleShare = async () => {
    if (!currentSong) return;
    try {
      await Share.share({
        message: `🎶 Check out "${currentSong.title}" by ${currentSong.artist} on MusicApp!`,
      });
    } catch (e) {}
  };

  const handleAddToPlaylist = async () => {
    const playlists = await UserAPI.getPlaylists(userId);
    setUserPlaylists(playlists || []);
    setShowAddToPlaylist(true);
  };

  const addSongToPlaylist = async (playlist: Playlist) => {
    if (!currentSong) return;
    await UserAPI.addToPlaylist(userId, playlist.id, currentSong);
    setShowAddToPlaylist(false);
    Alert.alert("Added", `"${currentSong.title}" added to "${playlist.name}"`);
  };

  if (!currentSong) return null;

  const progressPercent = (progressMs / (durationMs || 1)) * 100;

  return (
    <>
      <Pressable style={styles.miniPlayer} onPress={() => setShowFull(true)}>
        <BlurView intensity={80} tint="dark" style={styles.miniBlur}>
          <Image source={{ uri: currentSong.cover }} style={styles.miniCover} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.miniTitle} numberOfLines={1}>{currentSong.title}</Text>
            <Text style={styles.miniArtist} numberOfLines={1}>{currentSong.artist}</Text>
          </View>
          <View style={styles.miniActions}>
             <TouchableOpacity onPress={handleToggleLike} style={{ marginRight: 15 }}>
               <Heart color={isLiked ? "#1DB954" : "white"} size={20} fill={isLiked ? "#1DB954" : "transparent"} />
             </TouchableOpacity>
             <TouchableOpacity onPress={() => togglePlay()} style={styles.miniPlayBtn}>
               {isPlaying ? <Pause color="white" size={26} /> : <Play color="white" size={26} fill="white" />}
             </TouchableOpacity>
          </View>
          <View style={styles.miniProgressCont}>
             <View style={[styles.miniProgressBar, { width: `${progressPercent}%` }]} />
          </View>
        </BlurView>
      </Pressable>

      {/* Full Player Modal */}
      <Modal visible={showFull} animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView style={styles.fullPlayerContainer}>
          <LinearGradient colors={['#282828', '#121212']} style={{ flex: 1 }}>
            <View style={styles.fullPlayerHeader}>
              <TouchableOpacity onPress={() => setShowFull(false)}><X color="white" size={28} /></TouchableOpacity>
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.playingFrom}>PLAYING FROM</Text>
                <Text style={styles.vibeTitle} numberOfLines={1}>{currentSong.artist}</Text>
              </View>
              <TouchableOpacity onPress={() => { setShowFull(false); navigation.navigate('Settings'); }}>
                <Settings color="white" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.fullPlayerContent} showsVerticalScrollIndicator={false}>
              <View style={styles.coverCont}>
                 <Image source={{ uri: currentSong.cover }} style={styles.fullCover} />
              </View>
              
              <View style={styles.fullMeta}>
                 <View style={{ flex: 1 }}>
                    <Text style={styles.fullTitle} numberOfLines={1}>{currentSong.title}</Text>
                    <TouchableOpacity onPress={() => { setShowFull(false); navigation.navigate('ArtistDetail', { artist: currentSong.artist }); }}>
                       <Text style={styles.fullArtist}>{currentSong.artist}</Text>
                    </TouchableOpacity>
                 </View>
                 <TouchableOpacity onPress={handleToggleLike}>
                   <Heart color={isLiked ? "#1DB954" : "#a1a1aa"} size={32} fill={isLiked ? "#1DB954" : "transparent"} />
                 </TouchableOpacity>
              </View>

              {/* Seek Bar */}
              <View style={styles.fullSeekBarCont}>
                 <Pressable style={styles.fullSeekBar} onPress={(e) => {
                     const { locationX } = e.nativeEvent;
                     const percent = (locationX / (width - 60)) * 100;
                     seekTo(percent);
                 }}>
                    <View style={[styles.fullProgressBar, { width: `${progressPercent}%` }]} />
                    <View style={[styles.seekKnob, { left: `${progressPercent}%` }]} />
                 </Pressable>
                 <View style={styles.timeCont}>
                    <Text style={styles.timeText}>{formatTime(progressMs)}</Text>
                    <Text style={styles.timeText}>{formatTime(durationMs)}</Text>
                 </View>
              </View>
              
              {/* Playback Controls */}
              <View style={styles.fullControls}>
                  <TouchableOpacity onPress={() => toggleShuffle()}><Shuffle color={isShuffle ? "#1DB954" : "white"} size={22} /></TouchableOpacity>
                  <TouchableOpacity onPress={prev}><SkipBack color="white" size={40} fill="white" /></TouchableOpacity>
                  <TouchableOpacity style={styles.fullPlayBtn} onPress={() => togglePlay()}>
                    {isPlaying ? <Pause color="black" size={40} fill="black" /> : <Play color="black" size={40} fill="black" />}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={next}><SkipForward color="white" size={40} fill="white" /></TouchableOpacity>
                  <TouchableOpacity onPress={() => toggleRepeat()}>
                    {repeatMode === 'one' ? <Repeat1 color="#1DB954" size={22} /> : <Repeat color={repeatMode === 'all' ? "#1DB954" : "white"} size={22} />}
                  </TouchableOpacity>
              </View>

              {/* Extra Actions */}
              <View style={styles.extraControls}>
                 <TouchableOpacity onPress={handleShare}><Share2 color="#a1a1aa" size={24} /></TouchableOpacity>
                 <TouchableOpacity onPress={handleAddToPlaylist}><Plus color="#a1a1aa" size={24} /></TouchableOpacity>
                 <TouchableOpacity><ListMusic color="#a1a1aa" size={24} /></TouchableOpacity>
              </View>

              {/* Lyrics */}
              <View style={styles.lyricsBox}>
                 <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                   <Text style={{ color: 'white', fontWeight: '900', fontSize: 18 }}>Lyrics</Text>
                   <Mic2 color="#1DB954" size={22} />
                 </View>
                 {loadingLyrics ? (
                   <ActivityIndicator color="#1DB954" />
                 ) : (
                   <Text style={styles.lyricsText}>
                      {lyrics || "Lyrics are not available for this track."}
                   </Text>
                 )}
              </View>

              {/* Next Up Queue */}
              <View style={styles.upcomingSection}>
                 <Text style={styles.upcomingTitle}>Next Up</Text>
                 {playbackQueue.slice(queueIndex + 1, queueIndex + 6).map((item, i) => (
                    <TouchableOpacity key={item.id + i} style={styles.upcomingRow} onPress={() => setCurrentSong(item)}>
                       <Image source={{ uri: item.cover }} style={styles.upcomingThumb} />
                       <View style={{ flex: 1 }}>
                          <Text style={styles.upcomingName} numberOfLines={1}>{item.title}</Text>
                          <Text style={styles.upcomingArtist}>{item.artist}</Text>
                       </View>
                    </TouchableOpacity>
                 ))}
                 {playbackQueue.length <= queueIndex + 1 && (
                   <Text style={styles.emptyQueue}>Queue is empty. Play more songs!</Text>
                 )}
              </View>
            </ScrollView>
          </LinearGradient>
        </SafeAreaView>
      </Modal>

      {/* Add to Playlist Modal */}
      <Modal visible={showAddToPlaylist} transparent animationType="slide">
        <View style={styles.playlistModalOverlay}>
          <View style={styles.playlistModalContent}>
            <View style={styles.playlistModalHeader}>
              <Text style={styles.playlistModalTitle}>Add to Playlist</Text>
              <TouchableOpacity onPress={() => setShowAddToPlaylist(false)}><X color="white" size={24} /></TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              {userPlaylists.length === 0 ? (
                <Text style={{ color: '#71717a', textAlign: 'center', marginVertical: 30 }}>
                  No playlists yet. Create one in your Library!
                </Text>
              ) : (
                userPlaylists.map(p => (
                  <TouchableOpacity key={p.id} style={styles.playlistModalRow} onPress={() => addSongToPlaylist(p)}>
                    <ListMusic color="#1DB954" size={24} />
                    <View style={{ marginLeft: 15 }}>
                      <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>{p.name}</Text>
                      <Text style={{ color: '#71717a', fontSize: 12 }}>{p.songs?.length || 0} songs</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  miniPlayer: { position: 'absolute', bottom: 95, left: 10, right: 10, borderRadius: 12, overflow: 'hidden' },
  miniBlur: { flexDirection: 'row', alignItems: 'center', padding: 8, height: 64 },
  miniCover: { width: 48, height: 48, borderRadius: 4 },
  miniTitle: { color: 'white', fontSize: 14, fontWeight: '800' },
  miniArtist: { color: '#a1a1aa', fontSize: 12 },
  miniActions: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  miniPlayBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  miniProgressCont: { position: 'absolute', bottom: 0, left: 10, right: 10, height: 2, backgroundColor: 'rgba(255,255,255,0.1)' },
  miniProgressBar: { height: '100%', backgroundColor: '#fff' },
  fullPlayerContainer: { flex: 1, backgroundColor: '#000' },
  fullPlayerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  playingFrom: { color: '#a1a1aa', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  vibeTitle: { color: 'white', fontSize: 13, fontWeight: '900', marginTop: 2 },
  fullPlayerContent: { alignItems: 'center', paddingHorizontal: 30, paddingBottom: 50 },
  coverCont: { width: width - 60, height: width - 60, elevation: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.5, shadowRadius: 30 },
  fullCover: { width: '100%', height: '100%', borderRadius: 12 },
  fullMeta: { width: '100%', flexDirection: 'row', alignItems: 'center', marginTop: 40, marginBottom: 30 },
  fullTitle: { color: 'white', fontSize: 26, fontWeight: '900' },
  fullArtist: { color: '#a1a1aa', fontSize: 18, fontWeight: '700' },
  fullSeekBarCont: { width: '100%', marginBottom: 30 },
  fullSeekBar: { width: '100%', height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 },
  fullProgressBar: { height: '100%', backgroundColor: 'white' },
  seekKnob: { position: 'absolute', top: -3, width: 10, height: 10, borderRadius: 5, backgroundColor: 'white', marginLeft: -5 },
  timeCont: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  timeText: { color: '#71717a', fontSize: 12, fontWeight: '800' },
  fullControls: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 },
  fullPlayBtn: { width: 75, height: 75, backgroundColor: 'white', borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  extraControls: { width: '100%', flexDirection: 'row', justifyContent: 'space-around', marginBottom: 40 },
  lyricsBox: { width: '100%', backgroundColor: '#282828', borderRadius: 15, padding: 20, marginBottom: 30 },
  lyricsText: { color: 'white', fontSize: 20, fontWeight: '800', lineHeight: 30 },
  upcomingSection: { width: '100%', backgroundColor: '#1c1c1e', borderRadius: 15, padding: 20 },
  upcomingTitle: { color: 'white', fontSize: 16, fontWeight: '900', marginBottom: 20 },
  upcomingRow: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 15 },
  upcomingThumb: { width: 44, height: 44, borderRadius: 4 },
  upcomingName: { color: 'white', fontSize: 14, fontWeight: '700' },
  upcomingArtist: { color: '#71717a', fontSize: 12 },
  emptyQueue: { color: '#71717a', fontSize: 14, textAlign: 'center', marginVertical: 20 },
  playlistModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  playlistModalContent: { backgroundColor: '#282828', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 25, maxHeight: '60%' },
  playlistModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  playlistModalTitle: { color: 'white', fontSize: 20, fontWeight: '900' },
  playlistModalRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#333' },
});
