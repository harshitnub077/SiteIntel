import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const TEMPLATES = [
  { id: 't1', name: 'Pre-pour Foundation Check', vertical: 'construction', expected_defects: ['rebar spacing', 'formwork alignment', 'debris'] },
  { id: 't2', name: 'Daily Safety Walk', vertical: 'construction', expected_defects: ['missing ppe', 'trip hazard', 'improper scaffolding'] },
  { id: 't3', name: 'Punch-list Close-out', vertical: 'construction', expected_defects: ['paint scratch', 'drywall dent', 'missing fixture'] },
];

export default function TemplateSelectionScreen({ route, navigation }) {
  const { siteId } = route.params;

  const handleSelect = (template) => {
    // In production, create an Inspection record in WatermelonDB here.
    console.log("Starting inspection for site", siteId, "with template", template.name);
    
    // Pass the expected defects as context so GPT-4o-vision knows what to look for
    navigation.replace('Capture', { inspectionContext: template.expected_defects });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleSelect(item)}>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.subtitle}>AI Focus: {item.expected_defects.join(', ')}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Select Inspection Template</Text>
      <FlatList
        data={TEMPLATES}
        keyExtractor={t => t.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  headerText: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 12, elevation: 2 },
  title: { fontSize: 18, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
});
