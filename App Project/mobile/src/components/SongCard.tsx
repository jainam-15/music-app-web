import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MappedSong } from '../lib/api';

interface SongCardProps {
  song: MappedSong;
  onPress: (song: MappedSong) => void;
}

const { width } = Dimensions.get('window');

export const SongCard: React.FC<SongCardProps> = ({ song, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={() => onPress(song)}>
    <Image source={{ uri: song.cover }} style={styles.image} />
    <View style={styles.textCont}>
      <Text style={styles.title} numberOfLines={1}>{song.title}</Text>
      <Text style={styles.artist} numberOfLines={1}>{song.artist}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: { 
    width: (width - 60) / 2.2, 
    marginRight: 16, 
    marginBottom: 20, 
    backgroundColor: '#121212', 
    borderRadius: 8, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1c1c1e'
  },
  image: { 
    width: '100%', 
    aspectRatio: 1, 
    borderRadius: 4 
  },
  textCont: { padding: 10 },
  title: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: '800', 
    marginBottom: 4 
  },
  artist: { 
    color: '#a1a1aa', 
    fontSize: 12, 
    fontWeight: '600' 
  },
});
