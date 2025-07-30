import { CommentSection } from '@/components/ui/CommentSection';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TradeOverlay } from '@/components/ui/TradeOverlay';
import { ResizeMode, Video } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

const { height } = Dimensions.get('window');

interface VideoOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  video: {
    videoId: string;
    contentUrl: string;
    title: string;
    description?: string;
    mptIssuanceId: string;
    comments: Comment[];
  };
  xrplSeed?: string;
  onCommentAdded?: (videoId: string, newComment: Comment) => void;
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

export function VideoOverlay({ isVisible, onClose, video, xrplSeed, onCommentAdded }: VideoOverlayProps) {
  const [isTradeOverlayVisible, setIsTradeOverlayVisible] = useState(false);
  const [isCommentSectionVisible, setIsCommentSectionVisible] = useState(false);
  const videoRef = useRef<Video | null>(null);
  const commentSectionAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      videoRef.current?.setIsMutedAsync(false);
    } else {
      videoRef.current?.setIsMutedAsync(true);
      setIsCommentSectionVisible(false);
    }
  }, [isVisible]);

  useEffect(() => {
    Animated.timing(commentSectionAnim, {
      toValue: isCommentSectionVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isCommentSectionVisible]);

  const handleTradePress = () => {
    setIsTradeOverlayVisible(true);
  };

  const handleCommentPress = () => {
    setIsCommentSectionVisible(!isCommentSectionVisible);
  };

  const handleCommentAdded = (newComment: Comment) => {
    if (newComment && video?.videoId) {
      onCommentAdded?.(video.videoId, newComment);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <ThemedView style={styles.container}>
        <View style={styles.videoContainer}>
          <TouchableOpacity 
            style={styles.videoTouchable}
            onPress={async () => {
              if (videoRef.current) {
                const status = await videoRef.current.getStatusAsync();
                if (status.isLoaded) {
                  if (status.isPlaying) {
                    await videoRef.current.pauseAsync();
                  } else {
                    await videoRef.current.playAsync();
                  }
                }
              }
            }}
          >
            <Video
              ref={videoRef}
              source={{ uri: video.contentUrl }}
              style={styles.video}
              useNativeControls={false}
              resizeMode={ResizeMode.COVER}
              shouldPlay={true}
              isLooping
              isMuted={false}
            />
          </TouchableOpacity>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={handleTradePress}
            >
              <IconSymbol 
                name="arrow.triangle.2.circlepath"
                size={28}
                color="#fff"
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={handleCommentPress}
            >
              <IconSymbol 
                name="message.fill"
                size={28}
                color="#fff"
              />
              {video.comments?.length > 0 && (
                <View style={styles.commentBadge}>
                  <ThemedText style={styles.commentCount}>
                    {video.comments.length}
                  </ThemedText>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={onClose}
            >
              <IconSymbol 
                name="xmark"
                size={28}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.videoInfo}>
            <View style={styles.videoHeader}>
              <ThemedText style={styles.videoTitle}>{video.title}</ThemedText>
            </View>
            {video.description && (
              <ThemedText style={styles.videoDescription}>
                {video.description}
              </ThemedText>
            )}
          </View>
          
          <Animated.View 
            style={[
              styles.commentSectionContainer,
              {
                transform: [{
                  translateY: commentSectionAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0]
                  })
                }]
              }
            ]}
            pointerEvents={isCommentSectionVisible ? 'auto' : 'none'}
          >
            <CommentSection
              videoId={video.videoId}
              comments={video.comments || []}
              onCommentAdded={handleCommentAdded}
            />
          </Animated.View>
          
          <TradeOverlay
            isVisible={isTradeOverlayVisible}
            onClose={() => {
              setIsTradeOverlayVisible(false);
            }}
            videoId={video.videoId}
            mptIssuanceId={video.mptIssuanceId}
            xrplSeed={xrplSeed || ''}
          />
        </View>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
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
  commentSectionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    backgroundColor: 'transparent',
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
  }
}); 