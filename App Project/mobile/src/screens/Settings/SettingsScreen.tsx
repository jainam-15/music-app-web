import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Switch, Alert } from 'react-native';
import { ChevronLeft, ChevronRight, Volume2, Download, Wifi, Bell, Shield, Palette, Database, Info, CircleHelp } from 'lucide-react-native';

export const SettingsScreen: React.FC<any> = ({ navigation }) => {
  const [streamQuality, setStreamQuality] = useState('High');
  const [downloadQuality, setDownloadQuality] = useState('Very High');
  const [notifications, setNotifications] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [crossfade, setCrossfade] = useState(false);
  const [gapless, setGapless] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const SettingRow = ({ icon: Icon, title, subtitle, right, onPress }: any) => (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress}>
      <Icon color="#a1a1aa" size={22} />
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle && <Text style={styles.rowSub}>{subtitle}</Text>}
      </View>
      {right || <ChevronRight color="#555" size={20} />}
    </TouchableOpacity>
  );

  const ToggleRow = ({ icon: Icon, title, subtitle, value, onToggle }: any) => (
    <View style={styles.row}>
      <Icon color="#a1a1aa" size={22} />
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle && <Text style={styles.rowSub}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#333', true: '#1DB954' }}
        thumbColor="white"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft color="white" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
        <SectionHeader title="Audio" />
        <SettingRow 
          icon={Volume2} 
          title="Streaming Quality" 
          subtitle={streamQuality}
          onPress={() => {
            const options = ['Low', 'Normal', 'High', 'Very High'];
            const next = options[(options.indexOf(streamQuality) + 1) % options.length];
            setStreamQuality(next);
          }}
        />
        <SettingRow 
          icon={Download} 
          title="Download Quality" 
          subtitle={downloadQuality}
          onPress={() => {
            const options = ['Low', 'Normal', 'High', 'Very High'];
            const next = options[(options.indexOf(downloadQuality) + 1) % options.length];
            setDownloadQuality(next);
          }}
        />
        <ToggleRow icon={Volume2} title="Crossfade" subtitle="Smooth transitions between songs" value={crossfade} onToggle={setCrossfade} />
        <ToggleRow icon={Volume2} title="Gapless Playback" subtitle="No silence between tracks" value={gapless} onToggle={setGapless} />
        <ToggleRow icon={Volume2} title="Autoplay" subtitle="Play similar songs when queue ends" value={autoplay} onToggle={setAutoplay} />

        <SectionHeader title="Data & Storage" />
        <ToggleRow icon={Wifi} title="Data Saver" subtitle="Reduce data usage while streaming" value={dataSaver} onToggle={setDataSaver} />
        <SettingRow 
          icon={Database} 
          title="Clear Cache" 
          subtitle="Free up storage space"
          onPress={() => Alert.alert("Cache Cleared", "All cached data has been removed.")}
        />

        <SectionHeader title="Notifications" />
        <ToggleRow icon={Bell} title="Push Notifications" subtitle="Get updates on new releases" value={notifications} onToggle={setNotifications} />

        <SectionHeader title="Privacy" />
        <ToggleRow icon={Shield} title="Offline Mode" subtitle="Only play downloaded songs" value={offlineMode} onToggle={setOfflineMode} />
        <SettingRow 
          icon={Shield} 
          title="Privacy Policy" 
          subtitle="Read our privacy policy"
          onPress={() => Alert.alert("Privacy", "View the full privacy policy at musicapp.com/privacy")}
        />

        <SectionHeader title="About" />
        <SettingRow icon={Info} title="Version" subtitle="1.0.0" right={<Text style={styles.rowSub}>1.0.0</Text>} />
        <SettingRow icon={CircleHelp} title="Help & Support" onPress={() => Alert.alert("Support", "Contact us at support@musicapp.com")} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '900' },
  sectionHeader: { color: '#a1a1aa', fontSize: 13, fontWeight: '900', letterSpacing: 1, paddingHorizontal: 20, paddingTop: 30, paddingBottom: 10, textTransform: 'uppercase' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#121212' },
  rowTitle: { color: 'white', fontSize: 16, fontWeight: '700' },
  rowSub: { color: '#71717a', fontSize: 13, marginTop: 2 },
});
