import { IconSymbol } from '@/components/ui/IconSymbol';
import { TradeOverlay } from '@/components/ui/TradeOverlay';
import { ResizeMode, Video } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
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
  };
  xrplSeed?: string;
}

export function VideoOverlay({ isVisible, onClose, video, xrplSeed }: VideoOverlayProps) {
  const [isTradeOverlayVisible, setIsTradeOverlayVisible] = useState(false);
  const videoRef = useRef<Video | null>(null);

  useEffect(() => {
    if (isVisible) {
      videoRef.current?.setIsMutedAsync(false);
    } else {
      videoRef.current?.setIsMutedAsync(true);
    }
  }, [isVisible]);

  const handleTradePress = () => {
    setIsTradeOverlayVisible(true);
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
  }
}); 