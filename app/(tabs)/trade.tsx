import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { useUser } from '@/app/context/UserContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ScrollArea } from '@/components/ui/ScrollArea';

export default function Trade() {
  const { user } = useUser();
  const [amount, setAmount] = React.useState('');
  const [recipient, setRecipient] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleTrade = async () => {
    if (!amount || !recipient || !user?.metadata.wallet.seed) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch('/api/trade/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          recipientAddress: recipient,
          senderSeed: user.metadata.wallet.seed,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to send XRP');
      }

      Alert.alert('Success', 'Transaction completed successfully');
      setAmount('');
      setRecipient('');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to complete transaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollArea>
        <Card style={styles.card}>
          <ThemedText style={styles.title}>Trade XRP</ThemedText>
          
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Amount (XRP)</ThemedText>
            <Input
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="Enter amount"
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Recipient Address</ThemedText>
            <Input
              value={recipient}
              onChangeText={setRecipient}
              placeholder="Enter recipient's XRP address"
              style={styles.input}
            />
          </View>

          <Button
            onPress={handleTrade}
            style={styles.button}
            disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send XRP'}
          </Button>
        </Card>

        <Card style={[styles.card, styles.historyCard]}>
          <ThemedText style={styles.title}>Transaction History</ThemedText>
          {/* TODO: Add transaction history list */}
          <ThemedText style={styles.placeholder}>No recent transactions</ThemedText>
        </Card>
      </ScrollArea>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    padding: 16,
    marginBottom: 16,
  },
  historyCard: {
    minHeight: 200,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  input: {
    marginBottom: 0,
  },
  button: {
    marginTop: 8,
  },
  placeholder: {
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.5,
  },
});