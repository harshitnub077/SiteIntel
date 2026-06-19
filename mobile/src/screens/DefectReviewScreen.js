import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { database } from '../db';
import { useSyncStore } from '../store/syncStore';

export default function DefectReviewScreen({ route, navigation }) {
  const { photoPath } = route.params;
  const updateQueueCount = useSyncStore(state => state.updateQueueCount);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [defectData, setDefectData] = useState({
    label: '',
    severity: 'low',
    location_tag: 'Unknown'
  });

  useEffect(() => {
    analyzePhoto();
  }, []);

  const analyzePhoto = async () => {
    try {
      const formData = new FormData();
      formData.append('photo', { uri: `file://${photoPath}`, name: 'defect.jpg', type: 'image/jpeg' });

      const response = await fetch('http://localhost:4201/api/defects/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      if (data.success) {
        setDefectData({
          label: data.defect.ai_label,
          severity: data.defect.severity,
          location_tag: 'Floor 2, Room A'
        });
      }
    } catch (e) {
      console.error(e);
      setDefectData({
        label: 'Concrete hairline crack (Mocked)',
        severity: 'med',
        location_tag: 'Floor 2'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    try {
      await database.write(async () => {
        await database.get('defects').create(defect => {
          defect.photoUrl = photoPath;
          defect.aiLabel = defectData.label;
          defect.severity = defectData.severity;
          defect.locationTag = defectData.location_tag;
        });
      });
      updateQueueCount();
      Alert.alert("Saved", "Defect saved locally and queued for sync.");
      navigation.popToTop();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: `file://${photoPath}` }} style={styles.image} />
      
      <View style={styles.card}>
        {isAnalyzing ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={{ marginTop: 10 }}>GPT-4o-vision is analyzing...</Text>
          </View>
        ) : (
          <View style={{ padding: 20 }}>
            <Text style={styles.cardTitle}>Defect Review</Text>
            
            <Text style={styles.label}>AI Label</Text>
            <TextInput style={styles.input} value={defectData.label} onChangeText={t => setDefectData({...defectData, label: t})} />

            <Text style={styles.label}>Severity</Text>
            <View style={styles.severityRow}>
              {['low', 'med', 'high', 'critical'].map(s => (
                <TouchableOpacity key={s} style={[styles.severityBtn, defectData.severity === s && styles[`severity_${s}`]]} onPress={() => setDefectData({...defectData, severity: s})}>
                  <Text style={[styles.severityText, defectData.severity === s && {color: 'white'}]}>{s.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Location Tag</Text>
            <TextInput style={styles.input} value={defectData.location_tag} onChangeText={t => setDefectData({...defectData, location_tag: t})} />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Confirm & Save</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  image: { flex: 1, resizeMode: 'cover' },
  card: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, minHeight: 350 },
  cardTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 15 },
  severityRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  severityBtn: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20, backgroundColor: '#f0f0f0' },
  severityText: { fontWeight: '600', fontSize: 12 },
  severity_low: { backgroundColor: '#34A853' },
  severity_med: { backgroundColor: '#FBBC05' },
  severity_high: { backgroundColor: '#EA4335' },
  severity_critical: { backgroundColor: '#B31412' },
  saveButton: { backgroundColor: '#000', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});
