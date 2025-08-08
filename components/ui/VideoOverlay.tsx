import { CommentSection } from '@/components/ui/CommentSection';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TradeOverlay } from '@/components/ui/TradeOverlay';
import { ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
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
  onCommentAdded?: (newComment: Comment) => void;
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
  const commentDragY = useRef(new Animated.Value(0)).current;

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
  }, [isCommentSectionVisible, commentSectionAnim]);

  const handleTradePress = () => {
    setIsTradeOverlayVisible(true);
  };

  const handleCommentPress = () => {
    setIsCommentSectionVisible(!isCommentSectionVisible);
  };

  const handleCommentAdded = (newComment: Comment) => {
    if (newComment) {
      onCommentAdded?.(newComment);
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
          <View style={styles.tradeButtonContainer}>
            <View style={styles.tradeButtonShadow}>
              <TouchableOpacity onPress={handleTradePress} activeOpacity={0.9}>
                <LinearGradient
                  colors={["rgba(140, 82, 255, 1)", "rgba(166, 220, 255, 1)"]}
                  style={styles.tradeButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <IconSymbol 
                    name="arrow.triangle.2.circlepath"
                    size={48}
                    color="#fff"
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.buttonContainer}>
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
              <ThemedText style={styles.closeButton}>x</ThemedText>
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
                transform: [
                  {
                    translateY: Animated.add(
                      commentSectionAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [350, 0]
                      }),
                      commentDragY
                    )
                  }
                ],
                backgroundColor: 'transparent'
              }
            ]}
            pointerEvents={isCommentSectionVisible ? 'auto' : 'none'}
          >
            <CommentSection
              videoId={video.videoId}
              comments={video.comments || []}
              onClose={() => {
                Animated.timing(commentSectionAnim, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }).start(() => {
                  setIsCommentSectionVisible(false);
                  commentDragY.setValue(0);
                });
              }}
              onDragChange={(dy) => {
                commentDragY.setValue(Math.max(0, Math.min(350, dy)));
              }}
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
    right: 80,
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
    fontFamily: "Montserrat-Bold",
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  videoDescription: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: "Montserrat-Variable",
    color: '#fff',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  tradeButtonShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderRadius: 50,
    backgroundColor: 'transparent',
  },
  tradeButtonGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  tradeButtonContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 120,
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
    height: 350,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
  closeButton: {
    fontSize: 28,
    color: '#fff',
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    lineHeight: 28,
  }
}); 