import { useUser } from '@/app/context/UserContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { TradeOverlay } from '@/components/ui/TradeOverlay';
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
  mptIssuanceId: string;
  creator?: {
    metadata?: {
      profile?: {
        avatar?: string;
      };
      wallet?: {
        seed: string;
        address: string;
        balance: number;
      };
    };
  };
}

export default function ExploreScreen() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [focusedVideoId, setFocusedVideoId] = useState<string | null>(null);
  const [isTradeOverlayVisible, setIsTradeOverlayVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const videoRefs = useRef<{ [key: string]: Video | null }>({});
  const { user } = useUser();

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

  const handleTradePress = (video: VideoItem) => {
    setSelectedVideo(video);
    setIsTradeOverlayVisible(true);
  };

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
        <View style={styles.videoHeader}>
          <Image source={{ uri: item.creator?.metadata?.profile?.avatar }} style={styles.avatar} />
          <ThemedText style={styles.videoTitle}>{item.title}</ThemedText>
        </View>
        {item.description && (
          <ThemedText style={styles.videoDescription}>
            {item.description}
          </ThemedText>
        )}
        <Button 
          onPress={() => handleTradePress(item)}
          style={styles.tradeButton}
        >
          Trade Token
        </Button>
      </View>
      
      {selectedVideo && (
        <TradeOverlay
          isVisible={isTradeOverlayVisible}
          onClose={() => {
            setIsTradeOverlayVisible(false);
            setSelectedVideo(null);
          }}
          videoId={selectedVideo.videoId}
          mptIssuanceId={selectedVideo.mptIssuanceId}
          xrplSeed={user?.metadata?.wallet?.seed || ''}
        />
      )}
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
  videoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  videoTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  videoDescription: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 15,
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
  },
  tradeButton: {
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#fff',
    borderWidth: 1,
  }
}); 