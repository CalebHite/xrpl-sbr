import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useFocusEffect } from '@react-navigation/native';
import { ResizeMode, Video } from 'expo-av';
import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, StyleSheet, View } from 'react-native';
import { fetchVideos } from '../../scripts/fetchVideos';

const { height } = Dimensions.get('window');

export default function ExploreScreen() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      console.log('Explore tab focused - loading videos');
      loadVideos();
      
      return () => {
        console.log('Explore tab unfocused - cleaning up');
        setVideos([]);
        setError(null);
      };
    }, [])
  );

  const loadVideos = async () => {
    try {
      setLoading(true);
      const fetchedVideos = await fetchVideos();
      setVideos(fetchedVideos);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderVideo = ({ item }: { item: any }) => (
    <View style={styles.videoContainer}>
      <Video
        source={{ uri: item.contentUrl }}
        style={styles.video}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={false}
        isLooping
      />
      <View style={styles.videoInfo}>
        <Image source={{ uri:item.creator?.metadata?.profile?.avatar }} style={styles.avatar} />
        <ThemedText style={styles.videoTitle}>{item.title}</ThemedText>
        {item.description && (
          <ThemedText style={styles.videoDescription}>
            {item.description}
          </ThemedText>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator style={styles.loading} size="large" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.error}>Error: {error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={videos}
        renderItem={renderVideo}
        keyExtractor={(item) => item.videoId}
        pagingEnabled
        snapToInterval={height}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  videoContainer: {
    height: height,
    position: 'relative',
  },
  video: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoInfo: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  videoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#fff',
  },
  videoCreator: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  videoDescription: {
    fontSize: 14,
    color: '#fff',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    margin: 20,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 