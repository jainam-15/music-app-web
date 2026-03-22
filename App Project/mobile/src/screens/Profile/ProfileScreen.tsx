import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, SafeAreaView, Alert, Dimensions } from 'react-native';
import { LogOut, CheckCircle2, Headphones, Settings, Trash2, ChevronRight, Heart, Mic2 } from 'lucide-react-native';
import { useUserStore } from '../../store/useUserStore';
import { UserAPI } from '../../lib/api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export const ProfileScreen: React.FC = () => {
  const { user, logout, userId } = useUserStore();
  const navigation = useNavigation<any>();
  const [likedCount, setLikedCount] = useState(0);
  const [playlistCount, setPlaylistCount] = useState(0);

  useFocusEffect(useCallback(() => {
    UserAPI.getLikedSongs(userId).then(songs => setLikedCount(songs?.length || 0));
    UserAPI.getPlaylists(userId).then(playlists => setPlaylistCount(playlists?.length || 0));
  }, [userId]));

  const MenuItem = ({ icon: Icon, title, color = "white", subtitle, onPress }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Icon color={color} size={22} />
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={[styles.menuText, { color }]}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <ChevronRight color="#555" size={20} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
        <LinearGradient colors={['#1DB95433', '#000000']} style={styles.profileHero}>
            <Image source={{ uri: user?.photo || `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=1DB954&color=fff` }} style={styles.avatarXl} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.profileName}>{user?.name || 'User'}</Text>
              <CheckCircle2 color="#1DB954" size={20} fill="white" />
            </View>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            
            <View style={styles.profileStats}>
              <View style={styles.statBox}><Text style={styles.statVal}>{likedCount}</Text><Text style={styles.statLab}>Liked</Text></View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}><Text style={styles.statVal}>{playlistCount}</Text><Text style={styles.statLab}>Playlists</Text></View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}><Text style={styles.statVal}>0</Text><Text style={styles.statLab}>Following</Text></View>
            </View>

            <TouchableOpacity style={styles.editBtn} onPress={() => Alert.alert("Edit Profile", "Feature coming soon!")}>
                <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
        </LinearGradient>

        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
           <Text style={styles.sectionTitle}>Content</Text>
           <MenuItem 
             icon={Heart} title="Liked Songs" subtitle={`${likedCount} songs synced`} 
             onPress={() => navigation.navigate('Library')} 
           />
           <MenuItem 
             icon={Headphones} title="Listening History" subtitle="Recently played tracks" 
             onPress={() => navigation.navigate('Home')} 
           />
           <MenuItem 
             icon={Mic2} title="Artists you follow" subtitle="Browse artists from liked songs" 
             onPress={() => navigation.navigate('Library')} 
           />

           <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Account</Text>
           <MenuItem 
             icon={Settings} title="Settings" subtitle="Audio, data, privacy"
             onPress={() => navigation.navigate('Settings')} 
           />
           <MenuItem 
             icon={Trash2} title="Clear Play History" color="#dc2626" 
             onPress={() => {
               Alert.alert("Clear History", "This will remove all your recent plays.", [
                 { text: "Cancel", style: "cancel" },
                 { text: "Clear", style: "destructive", onPress: () => {
                   UserAPI.clearRecentPlays(userId);
                   Alert.alert("Cleared", "Your recent play history has been removed.");
                 }}
               ]);
             }} 
           />
           
           <TouchableOpacity style={styles.logoutBtn} onPress={() => { 
             Alert.alert("Logout", "Are you sure you want to log out?", [
               { text: "Cancel", style: "cancel" },
               { text: "Logout", style: "destructive", onPress: () => logout() }
             ]);
           }}>
              <LogOut color="#ef4444" size={20} /><Text style={styles.logoutText}>Logout</Text>
           </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  profileHero: { alignItems: 'center', paddingTop: 80, paddingBottom: 40, paddingHorizontal: 20 },
  avatarXl: { width: 130, height: 130, borderRadius: 65, marginBottom: 20, borderWidth: 4, borderColor: '#1DB954' },
  profileName: { color: 'white', fontSize: 32, fontWeight: '900' },
  profileEmail: { color: '#a1a1aa', fontSize: 15, marginTop: 5 },
  profileStats: { flexDirection: 'row', alignItems: 'center', marginTop: 30, gap: 25 },
  statBox: { alignItems: 'center', flex: 1 },
  statVal: { color: 'white', fontSize: 20, fontWeight: '900' },
  statLab: { color: '#71717a', fontSize: 12, marginTop: 2 },
  statDivider: { width: 1, height: 20, backgroundColor: '#333' },
  editBtn: { marginTop: 30, paddingHorizontal: 30, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#555' },
  editBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
  sectionTitle: { color: 'white', fontSize: 18, fontWeight: '900', marginBottom: 15, marginLeft: 5 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#121212' },
  menuText: { fontSize: 16, fontWeight: '700' },
  menuSubtitle: { color: '#71717a', fontSize: 12, marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 50, alignSelf: 'center', paddingBottom: 20 },
  logoutText: { color: '#ef4444', fontWeight: '800' },
});
