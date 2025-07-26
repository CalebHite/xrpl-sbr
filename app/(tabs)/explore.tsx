import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useFocusEffect } from '@react-navigation/native';
import { ResizeMode, Video } from 'expo-av';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, StyleSheet, View, ViewToken } from 'react-native';
import { fetchVideos } from '../../scripts/videos';

const { height } = Dimensions.get('window');

interface VideoItem {
  videoId: string;
  contentUrl: string;
  title: string;
  description?: string;
  creator?: {
    metadata?: {
      profile?: {
        avatar?: string;
      };
    };
  };
}

export default function ExploreScreen() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [focusedVideoId, setFocusedVideoId] = useState<string | null>(null);
  const videoRefs = useRef<{ [key: string]: Video | null }>({});

  const onViewableItemsChanged = useRef(({ changed }: { changed: ViewToken[] }) => {
    changed.forEach((change) => {
      const video = change.item as VideoItem;
      if (change.isViewable) {
        setFocusedVideoId(video.videoId);
        videoRefs.current[video.videoId]?.setIsMutedAsync(false);
      } else {
        videoRefs.current[video.videoId]?.setIsMutedAsync(true);
      }
    });
  });

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80 // Increase threshold to be more precise
  });

  useFocusEffect(
    React.useCallback(() => {
      console.log('Explore tab focused - loading videos');
      loadVideos();
      
      return () => {
        console.log('Explore tab unfocused - cleaning up');
        // Mute all videos when leaving the tab
        Object.values(videoRefs.current).forEach(videoRef => {
          videoRef?.setIsMutedAsync(true);
        });
        setVideos([]);
        setError(null);
        setFocusedVideoId(null);
      };
    }, [])
  );

  const loadVideos = async () => {
    try {
      setLoading(true);
      const fetchedVideos = await fetchVideos();
      setVideos(fetchedVideos);
      if (fetchedVideos.length > 0) {
        setFocusedVideoId(fetchedVideos[0].videoId);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderVideo = ({ item }: { item: VideoItem }) => (
    <View style={styles.videoContainer}>
      <Video
        ref={(ref) => {
          videoRefs.current[item.videoId] = ref;
          // Set initial mute state
          if (ref) {
            ref.setIsMutedAsync(item.videoId !== focusedVideoId);
          }
        }}
        source={{ uri: item.contentUrl }}
        style={styles.video}
        useNativeControls={false}
        resizeMode={ResizeMode.COVER}
        shouldPlay={true}
        isLooping
        isMuted={item.videoId !== focusedVideoId}
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
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
        removeClippedSubviews={false} // Ensure videos stay loaded
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
  },
  videoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  videoCreator: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  videoDescription: {
    fontSize: 14,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
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
  }
}); 