import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button } from 'react-native';
import { database } from '../db';
import { useSyncStore } from '../store/syncStore';

export default function HomeScreen({ navigation }) {
  const [sites, setSites] = useState([]);
  const queueCount = useSyncStore(state => state.queueCount);
  const isOnline = useSyncStore(state => state.isOnline);
  const isSyncing = useSyncStore(state => state.isSyncing);

  useEffect(() => {
    const fetchSites = async () => {
      const allSites = await database.get('sites').query().fetch();
      setSites(allSites);
    };
    fetchSites();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.subtitle}>{item.address} • {item.type}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Offline Ready</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.reportBtn} onPress={() => navigation.navigate('Report', { siteId: item.id })}>
            <Text style={styles.reportBtnText}>Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.startBtn} onPress={() => navigation.navigate('Templates', { siteId: item.id })}>
            <Text style={styles.startBtnText}>Start</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Sync Status Header */}
      <View style={[styles.syncHeader, isOnline ? styles.syncOnline : styles.syncOffline]}>
        <Text style={styles.syncText}>
          {isOnline ? (isSyncing ? 'Syncing...' : 'Online') : 'Offline Mode'}
        </Text>
        {queueCount > 0 && <Text style={styles.syncText}> • {queueCount} items queued</Text>}
      </View>

      <FlatList
        data={sites}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  syncHeader: { padding: 10, flexDirection: 'row', justifyContent: 'center' },
  syncOnline: { backgroundColor: '#34A853' },
  syncOffline: { backgroundColor: '#EA4335' },
  syncText: { color: 'white', fontWeight: 'bold' },
  list: { padding: 16 },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 12, elevation: 2 },
  title: { fontSize: 18, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  badge: { backgroundColor: '#e6f4ea', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#137333', fontSize: 12, fontWeight: '600' },
  reportBtn: { backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  reportBtnText: { color: '#333', fontWeight: 'bold' },
  startBtn: { backgroundColor: '#000', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  startBtnText: { color: '#fff', fontWeight: 'bold' }
});
