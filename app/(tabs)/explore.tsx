import { useUser } from '@/app/context/UserContext';
import { User } from '@/app/login';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TradeOverlay } from '@/components/ui/TradeOverlay';
import { UserProfileOverlay } from '@/components/ui/UserProfileOverlay';
import { followUser, getUser, unfollowUser } from '@/scripts/account';
import { useFocusEffect } from '@react-navigation/native';
import { ResizeMode, Video } from 'expo-av';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, TouchableOpacity, View, ViewToken } from 'react-native';
import { fetchVideos } from '../../scripts/videos';

const { height } = Dimensions.get('window');

interface Creator extends User {
  _id: string;
}

interface VideoItem {
  videoId: string;
  contentUrl: string;
  title: string;
  description?: string;
  mptIssuanceId: string;
  creator: Creator;
}

export default function ExploreScreen() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [focusedVideoId, setFocusedVideoId] = useState<string | null>(null);
  const [isTradeOverlayVisible, setIsTradeOverlayVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const videoRefs = useRef<{ [key: string]: Video | null }>({});
  const { user, setUser } = useUser();

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

  const handleProfilePress = async (video: VideoItem) => {
    try {
      // Pause the current video
      const videoRef = videoRefs.current[video.videoId];
      if (videoRef) {
        await videoRef.pauseAsync();
      }

      // Get the creator's full user data
      const userData = await getUser(video.creator._id);
      
      // Create a properly formatted user object
      const formattedCreator = {
        ...video.creator,
        metadata: {
          email: userData.metadata.email || '',
          dateOfBirth: userData.metadata.dateOfBirth || '',
          profile: {
            avatar: userData.metadata.profile.avatar || '',
            bio: userData.metadata.profile.bio || '',
            followers: userData.metadata.profile.followers || [],
            following: userData.metadata.profile.following || [],
            views: userData.metadata.profile.views || 0,
            trades: userData.metadata.profile.trades || 0
          },
          preferences: {
            theme: userData.metadata.preferences.theme || 'light',
            notifications: userData.metadata.preferences.notifications || false
          },
          videos: userData.metadata.videos || [],
          wallet: {
            seed: userData.metadata.wallet.seed || '',
            address: userData.metadata.wallet.address || '',
            balance: userData.metadata.wallet.balance || 0
          }
        }
      };
      
      setSelectedCreator(formattedCreator);
      setIsProfileVisible(true);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
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
      <TouchableOpacity 
        style={styles.videoTouchable}
        onPress={async () => {
          const videoRef = videoRefs.current[item.videoId];
          if (videoRef) {
            const status = await videoRef.getStatusAsync();
            if (status.isLoaded) {
              if (status.isPlaying) {
                await videoRef.pauseAsync();
              } else {
                await videoRef.playAsync();
              }
            }
          }
        }}
      >
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
      </TouchableOpacity>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => handleTradePress(item)}
        >
          <IconSymbol 
            name="arrow.triangle.2.circlepath"
            size={28}
            color="#fff"
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => handleProfilePress(item)}
        >
          <IconSymbol 
            name="person.fill"
            size={28}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.videoInfo}>
        <View style={styles.videoHeader}>
          <ThemedText style={styles.videoTitle}>{item.title}</ThemedText>
        </View>
        {item.description && (
          <ThemedText style={styles.videoDescription}>
            {item.description}
          </ThemedText>
        )}
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
        removeClippedSubviews={false}
      />
      
      {selectedCreator && (
        <UserProfileOverlay
          isVisible={isProfileVisible}
          onClose={() => {
            setIsProfileVisible(false);
            // Clear the selected creator after a short delay to allow the modal animation to complete
            setTimeout(() => setSelectedCreator(null), 300);
          }}
          user={selectedCreator}
          currentUserId={user?.username || ''}
          onFollow={async () => {
            if (selectedCreator._id) {
              await followUser(selectedCreator._id);
              // Get the updated current user data
              const updatedUser = await getUser();
              setUser(updatedUser.metadata);
              // Refresh the selected creator's data
              const updatedCreator = await getUser(selectedCreator._id);
              setSelectedCreator(prevCreator => ({
                ...prevCreator!,
                metadata: updatedCreator.metadata
              }));
            }
          }}
          onUnfollow={async () => {
            if (selectedCreator._id) {
              await unfollowUser(selectedCreator._id);
              // Get the updated current user data
              const updatedUser = await getUser();
              setUser(updatedUser.metadata);
              // Refresh the selected creator's data
              const updatedCreator = await getUser(selectedCreator._id);
              setSelectedCreator(prevCreator => ({
                ...prevCreator!,
                metadata: updatedCreator.metadata
              }));
            }
          }}
        />
      )}
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
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tradeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    gap: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoTouchable: {
    flex: 1,
  }
}); 