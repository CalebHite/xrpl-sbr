import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet } from 'react-native';

export default function ExploreScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Explore</ThemedText>
      <ThemedText style={styles.description}>
        Coming soon: Discover and connect with other users
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