import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { database } from '../db';
import { useSyncStore } from '../store/syncStore';

export default function ReportScreen({ route }) {
  const { siteId } = route.params;
  const isOnline = useSyncStore(state => state.isOnline);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateOfflinePDF = async (defects) => {
    let html = '<h1>FieldAI Offline Report</h1>';
    defects.forEach(d => {
      html += `<h3>${d.aiLabel}</h3><p>Severity: ${d.severity}</p><p>Location: ${d.locationTag}</p><hr/>`;
    });

    const options = {
      html: html,
      fileName: `FieldAI_Offline_Report_${siteId}`,
      directory: 'Documents',
    };

    const file = await RNHTMLtoPDF.convert(options);
    return file.filePath;
  };

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const defects = await database.get('defects').query().fetch();

      let pdfPath = null;

      if (isOnline) {
        // Fetch from API
        console.log("Generating online via Puppeteer...");
        const url = `http://localhost:4201/api/reports/${siteId}/pdf`;
        const localPath = FileSystem.documentDirectory + `report_${siteId}.pdf`;
        const { uri, status } = await FileSystem.downloadAsync(url, localPath);
        
        if (status === 200) {
          pdfPath = uri;
        } else {
          throw new Error('Failed to generate from server.');
        }
      } else {
        // Fallback to offline on-device generation
        console.log("Generating offline via RNHTMLtoPDF...");
        pdfPath = await generateOfflinePDF(defects);
      }

      // Trigger Share Sheet
      if (pdfPath && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfPath);
      } else {
        Alert.alert("Saved", `Report saved to: ${pdfPath}`);
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not generate report. " + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inspection Report</Text>
      <Text style={styles.subtitle}>Site ID: {siteId}</Text>
      
      <View style={{ flex: 1, justifyContent: 'center' }}>
        {isGenerating ? (
          <ActivityIndicator size="large" color="#000" />
        ) : (
          <TouchableOpacity style={styles.button} onPress={generateReport}>
            <Text style={styles.buttonText}>
              {isOnline ? "Generate Professional PDF" : "Generate Offline PDF"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
  button: { backgroundColor: '#000', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});
