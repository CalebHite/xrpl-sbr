"use client"

import { VideoOverlay } from '@/components/ui/VideoOverlay';
import { getUser, getVideos, logout, updateUser } from '@/scripts/account';
import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useUser } from '../context/UserContext';
const bgLight = require('../../assets/images/bg-light.png');
const virlLogoLightFull = require('../../assets/images/virl_logo_light_full.png');

export default function Profile() {
  const [showSettings, setShowSettings] = useState(false);
  const [showChangeBio, setShowChangeBio] = useState(false);
  const [newBio, setNewBio] = useState('');
  const { user, setUser } = useUser();
  const [image, setImage] = useState<string | undefined>(user?.metadata.profile.avatar);
  const [videos, setVideos] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isVideoOverlayVisible, setIsVideoOverlayVisible] = useState(false);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const videoRefs = useRef<{ [key: string]: Video | null }>({});
  
  useEffect(() => {
    getVideos(user?._id).then((videos) => {
      setVideos(videos.videos);
      setIsLoadingVideos(false);
      console.log(videos);
    }).catch(error => {
      console.error('Error loading videos:', error);
      setIsLoadingVideos(false);
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
    <ImageBackground source={bgLight} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
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
            <TouchableOpacity onPress={()=>{setShowSettings(!showSettings)}} style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileSection}>
            <Image source={virlLogoLightFull} style={styles.virlLogo} />
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
            <View style={styles.videosGrid}>
              {isLoadingVideos ? (
                <View style={styles.noVideosContainer}>
                  <ActivityIndicator size="large" color="#666" />
                </View>
              ) : videos.length > 0 ? (
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
            mptIssuanceId: selectedVideo.mptIssuanceId || '',
            comments: selectedVideo.comments || []
          }}
          xrplSeed={user?.metadata?.wallet?.seed}
        />
      )}
    </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "Montserrat-Bold",
  },
  settingsButton: {
    padding: 8,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 16,
  },
  virlLogo: {
    width: 260,
    height: 100,  
    marginVertical: 8,
    resizeMode: 'contain',
  },
  profilePictureContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
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
    width: 160,
    height: 160,
    borderRadius: 20,
    borderWidth: 1,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
    fontFamily: "Montserrat-Bold",
  },
  bioContainer: {
    width: "80%",
    padding: 4,
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
    padding: 20,
    marginBottom: 16,
    justifyContent: "space-around",
    borderRadius: 16,
    borderColor: '#101010',
    borderWidth: 1,
    marginHorizontal: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    color: "#333",
    fontFamily: "Montserrat-Bold",
  },
  statLabel: {
    fontSize: 14,
    color: "#000000",
    marginTop: 4,
    fontFamily: "Montserrat-Regular",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    fontFamily: "Montserrat-Bold",
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
    fontFamily: "Montserrat-Bold",
  },
  settingValue: {
    fontSize: 16,
    color: "#666",
    fontFamily: "Montserrat-Bold",
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
    fontFamily: "Montserrat-Bold",
  },
  videosSection: {
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    borderColor: '#101010',
    borderWidth: 1,
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
    borderRadius: 10,
  },
  videoInfo: {
    padding: 8,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#333',
    marginBottom: 4,
    fontFamily: "Montserrat-Bold",
  },
  videoViews: {
    fontSize: 12,
    color: '#666',
    fontFamily: "Montserrat-Bold",
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
    fontFamily: "Montserrat-Regular",
  },
});

