import React, { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
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
}

export function TradeOverlay({ isVisible, onClose, videoId, mptIssuanceId, xrplSeed }: TradeOverlayProps) {
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

          <ThemedText style={styles.title}>Trade Video</ThemedText>

          {!mode ? (
            <View style={styles.buttonContainer}>
              <Button 
                onPress={() => setMode('buy')} 
                style={styles.tradeButton}
              >
                Buy
              </Button>
              <Button 
                onPress={() => setMode('sell')} 
                style={styles.tradeButton}
              >
                Sell
              </Button>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <ThemedText style={styles.subtitle}>
                {mode === 'buy' ? 'Buy Order' : 'Sell Order'}
              </ThemedText>
              
              <Input
                placeholder="Enter amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                style={styles.input}
              />

              {error && (
                <ThemedText style={styles.error}>{error}</ThemedText>
              )}

              <View style={styles.buttonContainer}>
                <Button
                  onPress={handleTrade}
                  disabled={loading}
                  style={styles.submitButton}
                >
                  {loading ? 'Processing...' : 'Confirm'}
                </Button>
                <Button
                  onPress={() => setMode(null)}
                  style={styles.backButton}
                >
                  Back
                </Button>
              </View>
            </View>
          )}
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
    width: '80%',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    padding: 10,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 10,
  },
  tradeButton: {
    marginVertical: 5,
  },
  formContainer: {
    gap: 15,
  },
  input: {
    marginBottom: 10,
  },
  submitButton: {
    marginTop: 10,
  },
  backButton: {
    backgroundColor: '#666',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
}); 