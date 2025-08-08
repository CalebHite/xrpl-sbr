import React, { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { createBuyOrder, createSellOrder, isValidTradeAmount } from '../../scripts/trade';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { Button } from './Button';
import { Input } from './Input';

interface TradeOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  videoId: string;
  mptIssuanceId: string;
  xrplSeed: string;
  videoName?: string;
  creator?: string;
  thumbnailUrl?: string;
}

export function TradeOverlay({ 
  isVisible, 
  onClose, 
  videoId, 
  mptIssuanceId, 
  xrplSeed,
  videoName,
  creator,
  thumbnailUrl
}: TradeOverlayProps) {
  const [mode, setMode] = useState<'buy' | 'sell' | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);  

  const handleTrade = async () => {
    if (!isValidTradeAmount(amount)) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderData = {
        xrplSeed,
        mptIssuanceId,
        amount: Number(amount),
        tokenId: videoId,
        timeOutDuration: 3600
      };

      if (mode === 'buy') {
        await createBuyOrder(orderData);
      } else {
        await createSellOrder(orderData);
      }

      onClose();
      setAmount('');
      setMode(null);
    } catch (err: any) {
      console.error('Trade error:', err);
      setError(err.message || 'Failed to create trade order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Parse video information from videoId if not provided
  const parsedCreator = creator || videoId.split(':')[0];
  const parsedVideoName = videoName || videoId.split(':').slice(1)[0];

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <ThemedView style={styles.modalContent}>
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {/* Header with close button */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <ThemedText style={styles.closeButtonText}>×</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Video Information Section */}
            <View style={styles.videoInfoSection}>
              {thumbnailUrl && (
                <Image 
                  source={{ uri: thumbnailUrl }} 
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              )}
              
              <View style={styles.videoDetails}>
                <ThemedText style={styles.videoTitle}>
                  {parsedVideoName || 'Untitled Video'}
                </ThemedText>
                <ThemedText style={styles.creatorName}>
                  By {parsedCreator}
                </ThemedText>
                <ThemedText style={styles.videoId}>
                  Token ID: {videoId}
                </ThemedText>
              </View>
            </View>

            {/* Trade Section */}
            <View style={styles.tradeSection}>
              <ThemedText style={styles.title}>Trade Video Token</ThemedText>

              {!mode ? (
                <View style={styles.buttonContainer}>
                  <Button 
                    onPress={() => setMode('buy')} 
                    style={[styles.tradeButton, styles.buyButton]}
                    size="lg"
                  >
                    Create Buy Order
                  </Button>
                  <Button 
                    onPress={() => setMode('sell')} 
                    style={[styles.tradeButton, styles.sellButton]}
                    size="lg"
                  >
                    Create Sell Order
                  </Button>
                </View>
              ) : (
                <View style={styles.formContainer}>
                  <ThemedText style={styles.subtitle}>
                    {mode === 'buy' ? 'Create Buy Order' : 'Create Sell Order'}
                  </ThemedText>
                  
                  <View style={styles.orderDetails}>
                    <ThemedText style={styles.orderLabel}>Amount</ThemedText>
                    <Input
                      placeholder="Enter amount to trade"
                      value={amount}
                      onChangeText={setAmount}
                      keyboardType="numeric"
                      style={styles.input}
                    />
                  </View>

                  {error && (
                    <ThemedText style={styles.error}>{error}</ThemedText>
                  )}

                  <View style={styles.actionButtons}>
                    <Button
                      onPress={handleTrade}
                      disabled={loading}
                      style={[styles.submitButton, mode === 'buy' ? styles.buyButton : styles.sellButton]}
                      size="lg"
                    >
                      {loading ? 'Processing...' : `Confirm ${mode === 'buy' ? 'Buy' : 'Sell'} Order`}
                    </Button>
                    <Button
                      onPress={() => setMode(null)}
                      style={styles.backButton}
                      size="lg"
                    >
                      Back
                    </Button>
                  </View>
                </View>
              )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    height: '90%',
    backgroundColor: '#101010',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    elevation: 10,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 20,
    paddingBottom: 10,
  },
  closeButton: {
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    marginTop: 5,
    fontSize: 30,
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  videoInfoSection: {
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#333',
  },
  videoDetails: {
    gap: 8,
  },
  videoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  creatorName: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
    color: '#8C52FF',
    marginBottom: 8,
  },
  videoId: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#cccccc',
    opacity: 0.8,
  },
  mptId: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#cccccc',
    opacity: 0.8,
  },
  tradeSection: {
    flex: 1,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#ffffff',
  },
  buttonContainer: {
    gap: 16,
    marginTop: 10,
  },
  tradeButton: {
    borderRadius: 12,
    minHeight: 56,
    paddingVertical: 16,
  },
  buyButton: {
    backgroundColor: '#30bf2e',
  },
  sellButton: {
    backgroundColor: '#cf3652',
  },
  formContainer: {
    gap: 20,
    marginTop: 10,
  },
  orderDetails: {
    gap: 8,
  },
  orderLabel: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
  },
  actionButtons: {
    gap: 12,
    marginTop: 20,
  },
  submitButton: {
    borderRadius: 12,
    minHeight: 56,
    paddingVertical: 16,
  },
  backButton: {
    backgroundColor: '#333',
    borderRadius: 12,
    minHeight: 48,
    paddingVertical: 12,
  },
  error: {
    color: '#ff4444',
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
  },
}); 