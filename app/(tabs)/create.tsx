import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { createVideo } from '../../scripts/videos';

export default function CreateScreen() {
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickVideo = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert('Permission to access media library is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setVideoUri(result.assets[0].uri);
        setError(null);
      }
    } catch (err) {
      console.error('Error picking video:', err);
      setError('Failed to pick video');
    }
  };

  const handleUpload = async () => {
    if (!videoUri || !title.trim()) {
      setError('Please select a video and add a title');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      
      const result = await createVideo({
        videoUri,
        title: title.trim(),
        description: description.trim()
      });

      console.log('Video created:', result);
      
      // Reset form after successful upload
      setVideoUri(null);
      setTitle('');
      setDescription('');
      router.replace('/(tabs)/explore');
    } catch (err: any) {
      console.error('Error uploading video:', err);
      setError(err.message || 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  if (uploading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.uploadingText}>Creating your video token...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {!videoUri ? (
        <TouchableOpacity style={styles.pickButton} onPress={pickVideo}>
          <Ionicons name="cloud-upload" size={50} color="#ffffff" />
          <ThemedText style={styles.pickText}>Select a video to upload</ThemedText>
        </TouchableOpacity>
      ) : (
        <View style={styles.formContainer}>
          <Video
            source={{ uri: videoUri }}
            style={styles.videoPreview}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={false}
          />
          <Input
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />
          <Input
            placeholder="Description (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={styles.inputLarge}
          />
          {error && <ThemedText style={styles.error}>{error}</ThemedText>}
          <View style={styles.buttonContainer}>
            <Button 
              onPress={() => {
                setVideoUri(null);
                setError(null);
              }} 
              variant="secondary"
              style={styles.button}
            >
              Cancel
            </Button>
            <Button 
              onPress={handleUpload}
              style={styles.buttonUpload}
            >
              Upload
            </Button>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#101010',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'Montserrat-Bold',
  },
  pickButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderWidth: 3,
    borderColor: '#2fa4ff',
    borderStyle: 'dashed',
    borderRadius: 20,
    width: '100%',
    aspectRatio: 16/9,
  },
  pickText: {
    marginTop: 10,
    fontSize: 16,
  },
  formContainer: {
    width: '100%',
    backgroundColor: '#101010',
  },
  videoPreview: {
    width: '100%',
    aspectRatio: 16/9,
    borderRadius: 10,
    marginBottom: 20,
  },
  inputLarge: {
    marginBottom: 15,
    paddingBottom: 100,
    color: '#ffffff',
    fontFamily: 'Montserrat-Regular',
    borderRadius: 10,
  },
  input: {
    marginBottom: 15,
    color: '#ffffff',
    fontFamily: 'Montserrat-Regular',
    borderRadius: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    color: '#ffffff',
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    borderRadius: 10,
    flex: 1
  },
  buttonUpload: {
    backgroundColor: '#2fa4ff',
    color: '#ffffff',
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    borderRadius: 10,
    flex: 1
  },
  uploadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  error: {
    color: '#ff4444',
    marginBottom: 15,
    textAlign: 'center',
  }
}); 