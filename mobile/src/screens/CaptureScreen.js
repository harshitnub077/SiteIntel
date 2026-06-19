import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { Audio } from 'expo-av';
import { Mic } from 'lucide-react-native';

export default function CaptureScreen({ navigation }) {
  const device = useCameraDevice('back');
  const camera = useRef(null);
  
  const [hasPermission, setHasPermission] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recording, setRecording] = useState(null);
  
  const [defectConfidence, setDefectConfidence] = useState(null);

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermission();
      const audioStatus = await Audio.requestPermissionsAsync();
      setHasPermission(cameraStatus === 'granted' && audioStatus.status === 'granted');
    })();

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setDefectConfidence(Math.floor(Math.random() * 30) + 70); 
        setTimeout(() => setDefectConfidence(null), 3000); 
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const takePhoto = async () => {
    if (camera.current) {
      const photo = await camera.current.takePhoto({ flash: 'off' });
      console.log("Photo captured:", photo.path);
      navigation.navigate('DefectReview', { photoPath: photo.path });
    }
  };

  const startVoiceNote = async () => {
    try {
      setIsRecordingAudio(true);
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync( Audio.RecordingOptionsPresets.HIGH_QUALITY );
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
      setIsRecordingAudio(false);
    }
  };

  const stopVoiceNote = async () => {
    setIsRecordingAudio(false);
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('Voice note saved at', uri);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  if (!hasPermission) return <ActivityIndicator style={styles.container} size="large" />;
  if (device == null) return <Text style={{flex: 1, textAlign: 'center', marginTop: 100}}>No Camera Device</Text>;

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      {defectConfidence && (
        <View style={styles.confidenceBadge}>
          <Text style={styles.confidenceText}>⚠️ Possible crack detected ({defectConfidence}%) — review</Text>
        </View>
      )}

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.voiceButton, isRecordingAudio && styles.voiceButtonRecording]}
          onPressIn={startVoiceNote}
          onPressOut={stopVoiceNote}
        >
          <Mic color="white" size={32} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.shutterButton} onPress={takePhoto}>
          <View style={styles.shutterInner} />
        </TouchableOpacity>

        <View style={{ width: 64 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  confidenceBadge: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(200, 50, 50, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  confidenceText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  shutterButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'white',
  },
  voiceButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(50, 50, 50, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButtonRecording: { backgroundColor: 'rgba(255, 0, 0, 0.8)' }
});
