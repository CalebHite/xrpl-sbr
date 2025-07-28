import { getVideos } from '@/scripts/account';
import { ResizeMode, Video } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { Button } from './Button';
import { Card } from './Card';

interface UserProfileOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  user: {
    username: string;
    metadata: {
      profile: {
        avatar: string;
        bio: string;
        followers: string[];
        following: string[];
        views: number;
        trades: number;
      };
      videos: string[];
    };
  };
  currentUserId: string;
  onFollow: () => Promise<void>;
  onUnfollow: () => Promise<void>;
}

export function UserProfileOverlay({ 
  isVisible, 
  onClose, 
  user,
  currentUserId,
  onFollow,
  onUnfollow 
}: UserProfileOverlayProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profile = user?.metadata?.profile || {
    avatar: '',
    bio: '',
    followers: [],
    following: [],
    views: 0,
    trades: 0
  };

  const [videos, setVideos] = useState<any[]>([]);
  const isFollowing = profile.followers.includes(currentUserId);

  useEffect(() => {
      getVideos(user?._id).then((videos) => {
      setVideos(videos.videos);
      console.log(videos);
    });
  }, [user]);

  const handleFollowAction = async () => {
    setLoading(true);
    setError(null);

    try {
      if (isFollowing) {
        await onUnfollow();
      } else {
        await onFollow();
      }
    } catch (err: any) {
      console.error('Follow action error:', err);
      setError(err.message || 'Failed to update follow status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ThemedView style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <ThemedText style={styles.closeButtonText}>×</ThemedText>
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.profileSection}>
              <Image 
                source={{ uri: profile.avatar || 'https://via.placeholder.com/100' }} 
                style={styles.profilePicture} 
              />
              <ThemedText style={styles.username}>@{user?.username || 'Unknown'}</ThemedText>
              
              <Button
                onPress={handleFollowAction}
                disabled={loading}
                style={[
                  styles.followButton,
                  isFollowing && styles.followingButton
                ]}
              >
                {loading ? 'Following...' : (isFollowing ? 'Following' : 'Follow')}
              </Button>

              {error && (
                <ThemedText style={styles.error}>{error}</ThemedText>
              )}

              <Card style={styles.bioCard}>
                <ThemedText style={styles.bio}>
                  {profile.bio || 'No bio available'}
                </ThemedText>
              </Card>
            </View>

            <View style={styles.statsSection}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {profile.followers.length}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Followers</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {profile.following.length}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Following</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {profile.views}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Views</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {profile.trades}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Trades</ThemedText>
              </View>
            </View>
            <View style={styles.videosSection}>
            <Text style={styles.sectionTitle}>Videos</Text>
            <View style={styles.videosGrid}>
              {videos.length > 0 ? (
                videos.map((video, index) => (
                  <TouchableOpacity 
                    key={video._id || index}
                    style={styles.videoItem}
                    onPress={() => {
                      // Handle video press
                      console.log('Video pressed:', video);
                    }}
                  >
                    <Video
                      source={{ uri: video.contentUrl }}
                      style={styles.videoThumbnail}
                      useNativeControls={false}
                      resizeMode={ResizeMode.COVER}
                      shouldPlay={false}
                      isLooping={false}
                      isMuted={true}
                    />
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noVideosContainer}>
                  <Text style={styles.noVideosText}>No videos yet</Text>
                </View>
              )}
            </View>
            </View>
          </ScrollView>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    padding: 20,
    borderRadius: 15,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    padding: 10,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 20,
    gap: 12,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  followButton: {
    minWidth: 120,
  },
  followingButton: {
    backgroundColor: '#666',
  },
  bioCard: {
    width: '100%',
    padding: 12,
  },
  bio: {
    textAlign: 'center',
    fontSize: 14,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
  videosSection: {
    padding: 16,
  },
  videosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  videoItem: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  videoThumbnail: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  videoInfo: {
    padding: 8,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  videoViews: {
    fontSize: 12,
    color: '#666',
  },
  noVideosContainer: {
    width: '100%',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noVideosText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
}); 