import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet } from 'react-native';

export default function InboxScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Inbox</ThemedText>
      <ThemedText style={styles.description}>
        Coming soon: View and manage your messages
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
}); 