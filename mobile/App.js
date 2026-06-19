import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { database } from './src/db';
import { useSyncStore } from './src/store/syncStore';
import HomeScreen from './src/screens/HomeScreen';
import TemplateSelectionScreen from './src/screens/TemplateSelectionScreen';
import CaptureScreen from './src/screens/CaptureScreen';
import DefectReviewScreen from './src/screens/DefectReviewScreen';
import ReportScreen from './src/screens/ReportScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const initNetworkListener = useSyncStore(state => state.initNetworkListener);

  useEffect(() => {
    initNetworkListener(); // Start listening for offline -> online transitions

    const seedDB = async () => {
      try {
        const sitesCollection = database.get('sites');
        const response = await fetch('http://localhost:4201/api/defects/upload');
        const count = await sitesCollection.query().fetchCount();
        if (count === 0) {
          await database.write(async () => {
            await sitesCollection.create(site => {
              site.orgId = 'org_1'
              site.name = 'Downtown Highrise'
              site.address = '100 Main St'
              site.type = 'construction'
            });
          });
        }
      } catch (error) {
        console.error("DB Seed Error:", error);
      } finally {
        setIsReady(true);
      }
    };
    seedDB();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading Architecture...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Sites' }} />
        <Stack.Screen name="Templates" component={TemplateSelectionScreen} options={{ title: 'Templates' }} />
        <Stack.Screen name="Capture" component={CaptureScreen} options={{ headerShown: false }} />
        <Stack.Screen name="DefectReview" component={DefectReviewScreen} options={{ title: 'Review Defect' }} />
        <Stack.Screen name="Report" component={ReportScreen} options={{ title: 'Report' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
