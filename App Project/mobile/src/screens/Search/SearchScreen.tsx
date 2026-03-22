import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet, SafeAreaView, ActivityIndicator, Dimensions, ScrollView, Alert } from 'react-native';
import { Search as SearchIcon, ChevronRight, Mic, Camera } from 'lucide-react-native';
import { usePlayerStore } from '../../store/usePlayerStore';
import { searchSongs, MappedSong } from '../../lib/api';

const { width } = Dimensions.get('window');

const BROWSE_CATEGORIES = [
  { title: "Pop", color: "#e91e63", image: "https://t.scdn.co/images/0a74d96e08224b41ad6092827d079d84" },
  { title: "Hip-Hop", color: "#bc59ff", image: "https://i.scdn.co/image/ab67706f0000feaf247545e856852a46" },
  { title: "Bollywood", color: "#ff9800", image: "https://i.scdn.co/image/ab67706f0000feaf640073e51ffc2975" },
  { title: "Romance", color: "#ff112b", image: "https://i.scdn.co/image/ab67706f0000feaf83963f4129598816" },
  { title: "Party", color: "#4c1d95", image: "https://i.scdn.co/image/ab67706f0000feaffa935c13b56a3127" },
  { title: "Study", color: "#475569", image: "https://i.scdn.co/image/ab67706f0000feaf0778c1c4f686dc96" }
];

export const SearchScreen: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MappedSong[]>([]);
  const [loading, setLoading] = useState(false);
  const { setCurrentSong } = usePlayerStore();

  const handleSearch = async (t: string) => {
    setQuery(t);
    if (t.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const s = await searchSongs(t, 20);
      setResults(s);
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setLoading(false);
    }
  };

  const CategoryCard = ({ item }: any) => (
    <TouchableOpacity 
      style={[styles.catCard, { backgroundColor: item.color }]} 
      onPress={() => {
        handleSearch(item.title);
      }}
    >
      <Text style={styles.catTitle}>{item.title}</Text>
      <Image source={{ uri: item.image }} style={styles.catImage} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ paddingHorizontal: 20, paddingTop: 70 }}>
        <View style={styles.searchHeader}>
          <Text style={styles.screenTitle}>Search</Text>
          <TouchableOpacity onPress={() => Alert.alert("Coming Soon", "Search by camera for songs!")}>
             <Camera color="white" size={24} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchBar}>
          <SearchIcon color="#333" size={22} />
          <TextInput 
            style={styles.searchInput} 
            placeholder="What do you want to listen to?" 
            placeholderTextColor="#71717a" 
            value={query} 
            onChangeText={handleSearch} 
          />
          <TouchableOpacity onPress={() => Alert.alert("Voice Search", "Microphone required for voice search.")}>
            <Mic color="#333" size={22} />
          </TouchableOpacity>
        </View>
      </View>

      {query.length < 2 ? (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 150 }}>
          <Text style={styles.sectionTitle}>Browse all</Text>
          <View style={styles.browseGrid}>
            {BROWSE_CATEGORIES.map((cat, i) => (
              <CategoryCard key={i} item={cat} />
            ))}
          </View>
        </ScrollView>
      ) : (
        <>
          {loading ? (
            <ActivityIndicator color="#1DB954" style={{ marginTop: 20 }} />
          ) : (
            <FlatList 
              data={results} 
              keyExtractor={(item, i) => item.id + i} 
              contentContainerStyle={{ paddingBottom: 150 }} 
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.playlistRow} onPress={() => setCurrentSong(item, results)}>
                  <Image source={{ uri: item.cover }} style={styles.playlistThumb} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.playlistName} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.playlistInfo}>{item.artist}</Text>
                  </View>
                  <ChevronRight color="#71717a" size={18} />
                </TouchableOpacity>
              )} 
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  searchHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  screenTitle: { fontSize: 32, fontWeight: '900', color: '#fff' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 8, gap: 10, marginBottom: 20 },
  searchInput: { flex: 1, color: '#000', fontSize: 16, fontWeight: '700' },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 20 },
  browseGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 15 },
  catCard: { 
    width: (width - 55) / 2, 
    height: 100, 
    borderRadius: 8, 
    padding: 12, 
    overflow: 'hidden',
    position: 'relative'
  },
  catTitle: { color: 'white', fontSize: 18, fontWeight: '900' },
  catImage: { 
    width: 70, 
    height: 70, 
    position: 'absolute', 
    bottom: -5, 
    right: -15, 
    transform: [{ rotate: '25deg' }],
    borderRadius: 4
  },
  playlistRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 14, marginBottom: 20 },
  playlistThumb: { width: 56, height: 56, borderRadius: 4 },
  playlistName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  playlistInfo: { color: '#71717a', fontSize: 13 },
});
