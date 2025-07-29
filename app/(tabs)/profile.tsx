"use client"

import { VideoOverlay } from '@/components/ui/VideoOverlay';
import { getUser, getVideos, logout, updateUser } from '@/scripts/account';
import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from "react";
import { Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useUser } from '../context/UserContext';

export default function Profile() {
  const [showSettings, setShowSettings] = useState(false);
  const [showChangeBio, setShowChangeBio] = useState(false);
  const [newBio, setNewBio] = useState('');
  const { user, setUser } = useUser();
  const [image, setImage] = useState<string | undefined>(user?.metadata.profile.avatar);
  const [videos, setVideos] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isVideoOverlayVisible, setIsVideoOverlayVisible] = useState(false);
  const videoRefs = useRef<{ [key: string]: Video | null }>({});
  
  useEffect(() => {
    getVideos(user?._id).then((videos) => {
      setVideos(videos.videos);
      console.log(videos);
    });
  }, [user]);

  const convertImageToBase64 = async (uri: string) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error('Error converting image:', error);
      throw error;
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
  
    if (!result.canceled) {
      try {
        const manipResult = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 300 } }],
          { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
        );

        setImage(manipResult.uri);
        const base64Image = await convertImageToBase64(manipResult.uri);
        
        await updateUser({
          avatar: base64Image
        });
        
        // Update local user state
        if (user) {
          setUser({
            ...user,
            metadata: {
              ...user.metadata,
              profile: {
                ...user.metadata.profile,
                avatar: base64Image
              }
            }
          });
        }
      } catch (error) {
        console.error('Failed to update profile picture:', error);
        Alert.alert('Error', 'Failed to update profile picture');
        setImage(user?.metadata.profile.avatar);
      }
    }
  };

  const handleBioChange = async () => {
    if (!user) return;
    
    try {
      await updateUser({
        bio: newBio
      });
      
      // Update local user state
      setUser({
        ...user,
        metadata: {
          ...user.metadata,
          profile: {
            ...user.metadata.profile,
            bio: newBio
          }
        }
      });
      setShowChangeBio(false);
    } catch (error) {
      console.error('Failed to update bio:', error);
      Alert.alert('Error', 'Failed to update bio');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
    } catch (error) {
      console.error('Failed to logout:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  useEffect(() => {
    // Refresh user data
    getUser().then((userData) => {
      setUser(userData);
    }).catch(error => {
      console.error('Failed to fetch user data:', error);
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {showSettings ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={()=>{setShowSettings(false)}}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Settings</Text>
          </View>
          <View style={styles.settingsSection}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Theme</Text>
              <Text style={styles.settingValue}>{user?.metadata.preferences.theme}</Text>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Text style={styles.settingValue}>{user?.metadata.preferences.notifications ? 'Enabled' : 'Disabled'}</Text>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Email</Text>
              <Text style={styles.settingValue}>{user?.metadata.email}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.settingItem, styles.logoutButton]} 
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity onPress={()=>{setShowSettings(!showSettings)}} style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileSection}>
            <View style={styles.profilePictureContainer}>
              <Image source={{ uri: image || user?.metadata.profile.avatar }} style={styles.profilePicture} />
              <TouchableOpacity style={styles.changeAvatarButton} onPress={pickImage}>
                <Ionicons name="camera-outline" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.username}>@{user?.username}</Text>
            
            <TouchableOpacity 
              style={styles.bioContainer}
              onPress={() => {
                setShowChangeBio(true);
                setNewBio(user?.metadata.profile.bio || '');
              }}
            >
              {showChangeBio ? (
                <TextInput
                  style={styles.bioInput}
                  value={newBio}
                  onChangeText={setNewBio}
                  placeholder="Write something about yourself..."
                  multiline
                  onBlur={handleBioChange}
                  onSubmitEditing={handleBioChange}
                />
              ) : (
                <Text style={styles.bio}>{user?.metadata.profile.bio || 'Add a bio...'}</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.metadata.profile.followers.length}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.metadata.profile.following.length}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.metadata.profile.views}</Text>
              <Text style={styles.statLabel}>Views</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.metadata.profile.trades}</Text>
              <Text style={styles.statLabel}>Trades</Text>
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
                      setSelectedVideo(video);
                      setIsVideoOverlayVisible(true);
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
      )}

      {selectedVideo && (
        <VideoOverlay
          isVisible={isVideoOverlayVisible}
          onClose={() => {
            setIsVideoOverlayVisible(false);
            setSelectedVideo(null);
          }}
          video={{
            videoId: selectedVideo._id,
            contentUrl: selectedVideo.contentUrl,
            title: selectedVideo.title || '',
            description: selectedVideo.description || '',
            mptIssuanceId: selectedVideo.mptIssuanceId || ''
          }}
          xrplSeed={user?.metadata?.wallet?.seed}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e5e9",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  settingsButton: {
    padding: 8,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  profilePictureContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  bioContainer: {
    width: "80%",
    padding: 16,
  },
  bio: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  bioInput: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  statsSection: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 16,
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },

  settingsSection: {
    backgroundColor: "#fff",
    marginTop: 16,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingLabel: {
    fontSize: 16,
    color: "#333",
  },
  settingValue: {
    fontSize: 16,
    color: "#666",
  },
  changeAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#ff4444',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  videosSection: {
    backgroundColor: '#fff',
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
});

