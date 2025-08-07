import { useUser } from '@/app/context/UserContext';
import { User } from '@/app/login';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { CommentSection } from '@/components/ui/CommentSection';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TradeOverlay } from '@/components/ui/TradeOverlay';
import { UserProfileOverlay } from '@/components/ui/UserProfileOverlay';
import { VideoOverlay } from '@/components/ui/VideoOverlay';
import { followUser, getUser, unfollowUser } from '@/scripts/account';
import { useFocusEffect } from '@react-navigation/native';
import { ResizeMode, Video } from 'expo-av';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, FlatList, StyleSheet, TouchableOpacity, View, ViewToken } from 'react-native';
import { fetchVideos } from '../../scripts/videos';

const { height } = Dimensions.get('window');

interface Creator extends User {
  _id: string;
}

interface Comment {
  _id: string;
  userId: {
    _id: string;
    username: string;
    metadata: {
      profile: {
        avatar: string;
      }
    }
  };
  text: string;
  createdAt: Date;
}

interface VideoItem {
  videoId: string;
  contentUrl: string;
  title: string;
  description?: string;
  mptIssuanceId: string;
  creator: Creator;
  comments: Comment[];
}

export default function ExploreScreen() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [focusedVideoId, setFocusedVideoId] = useState<string | null>(null);
  const [isTradeOverlayVisible, setIsTradeOverlayVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [isVideoOverlayVisible, setIsVideoOverlayVisible] = useState(false);
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [isCommentSectionVisible, setIsCommentSectionVisible] = useState<string | null>(null);
  const commentSectionAnim = useRef(new Animated.Value(0)).current;
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

  const handleVideoPress = (video: VideoItem) => {
    setSelectedVideo(video);
    setIsVideoOverlayVisible(true);
  };

  const handleCommentPress = (videoId: string) => {
    if (isCommentSectionVisible === videoId) {
      // If the same section is visible, hide it
      Animated.timing(commentSectionAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsCommentSectionVisible(null);
      });
    } else {
      // If a different section should be shown, or none is currently shown
      setIsCommentSectionVisible(videoId);
      Animated.timing(commentSectionAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  // Animation is now handled in handleCommentPress

  const handleCommentAdded = (videoId: string, newComment: Comment) => {
    if (!videoId || !newComment) {
      console.warn('Invalid comment data:', { videoId, newComment });
      return;
    }

    setVideos(prevVideos => 
      prevVideos.map(video => {
        if (video.videoId === videoId) {
          return {
            ...video,
            comments: Array.isArray(video.comments) 
              ? [...video.comments, newComment]
              : [newComment]
          };
        }
        return video;
      })
    );
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
        onLongPress={() => handleVideoPress(item)}
        delayLongPress={200}
      >
        <Video
          ref={(ref) => {
            videoRefs.current[item.videoId] = ref;
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
          onPress={() => handleCommentPress(item.videoId)}
        >
          <IconSymbol 
            name="message.fill"
            size={28}
            color="#fff"
          />
          {item.comments?.length > 0 && (
            <View style={styles.commentBadge}>
              <ThemedText style={styles.commentCount}>
                {item.comments.length}
              </ThemedText>
            </View>
          )}
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

      {isCommentSectionVisible === item.videoId && (
        <Animated.View 
          style={[
            styles.commentSectionContainer,
            {
              transform: [{
                translateY: commentSectionAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, 0]
                })
              }],
              backgroundColor: '#fff'
            }
          ]}
        >
          <CommentSection
            videoId={item.videoId}
            comments={item.comments || []}
            onCommentAdded={(newComment) => {
              if (newComment) {
                handleCommentAdded(item.videoId, newComment);
              }
            }}
          />
        </Animated.View>
      )}
      
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
      
      {selectedVideo && (
        <VideoOverlay
          isVisible={isVideoOverlayVisible}
          onClose={() => {
            setIsVideoOverlayVisible(false);
            setSelectedVideo(null);
          }}
          video={selectedVideo}
          xrplSeed={user?.metadata?.wallet?.seed}
          onCommentAdded={(newComment) => {
            if (selectedVideo && newComment) {
              handleCommentAdded(selectedVideo.videoId, newComment);
            }
          }}
        />
      )}

      {selectedCreator && (
        <UserProfileOverlay
          isVisible={isProfileVisible}
          onClose={() => {
            setIsProfileVisible(false);
            setTimeout(() => setSelectedCreator(null), 300);
          }}
          user={selectedCreator}
          currentUserId={user?.username || ''}
          onFollow={async () => {
            if (selectedCreator._id) {
              await followUser(selectedCreator._id);
              const updatedUser = await getUser();
              setUser(updatedUser.metadata);
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
              const updatedUser = await getUser();
              setUser(updatedUser.metadata);
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    fontFamily: "Montserrat-Bold",
  },
  videoTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    fontWeight: "bold",
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  videoDescription: {
    fontSize: 18,
    fontWeight: "900",
    fontFamily: "Montserrat-Variable",
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
  },
  commentBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  commentCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  commentSectionContainer: {
    position: 'absolute',
    bottom: 75,
    left: 0,
    right: 0,
    height: 300,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  }
}); 