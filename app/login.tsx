import { AxiosError } from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createUser, login } from '@/scripts/account';
import { useUser } from './context/UserContext';

export type User = {
  _id: string;
  username: string;
  metadata: {
    email: string;
    dateOfBirth: string;
    profile: {
      bio: string;
      avatar: string;
      followers: string[];
      following: string[];
      views: number;
      trades: number;
    };
    preferences: {
      theme: 'light' | 'dark';
      notifications: boolean;
    };
    videos: string[];
    wallet: {
      seed: string;
      address: string;
      balance: number;
    };
  };
};

interface ErrorResponse {
  error: string;
}

export default function Login() {
  const { setUser } = useUser();
  const [stage, setStage] = useState<'intro' | 'form'>('intro');
  const [isSignup, setIsSignup] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const handleLogin = async () => {
    try {
      if (!username || !password) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
      setSubmitting(true);
      const user = await login(username, password);
      setUser(user);
      router.replace('/(tabs)/explore');
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      Alert.alert(
        'Error',
        axiosError.response?.data?.error ||
          'Failed to login. Please check your credentials and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async () => {
    try {
      if (!username || !password || !email) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
      setSubmitting(true);
      const user = await createUser(username, password, email);
      setUser(user);
      router.replace('/(tabs)/explore');
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      Alert.alert(
        'Error',
        axiosError.response?.data?.error || 'Failed to create account. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (stage === 'intro') {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.contentCenter}>
          <Image
            source={require('../assets/images/virl_logo_light_full.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText style={styles.title}>Welcome</ThemedText>
          <ThemedText style={styles.subtitle}>
            Sign in to explore creators and trade on VIRL
          </ThemedText>

          <Button style={styles.primary} onPress={() => setStage('form')}>
            Login
          </Button>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.title}>{isSignup ? 'Create account' : 'Login'}</ThemedText>
        <View style={styles.form}>
          <Input
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!submitting}
          />
          <Input
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!submitting}
          />
          {isSignup && (
            <Input
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!submitting}
            />
          )}

          <Button
            onPress={isSignup ? handleSignup : handleLogin}
            disabled={submitting}
            style={styles.primary}
          >
            {isSignup ? 'Sign up' : 'Login'}
          </Button>

          <ThemedText
            onPress={() => setIsSignup(!isSignup)}
            disabled={submitting}
            style={styles.secondaryText}
          >
            {isSignup ? 'Back to login' : 'Or Create account'}
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  contentCenter: { width: '100%', maxWidth: 360, alignItems: 'center' },
  content: { width: '100%', maxWidth: 360 },
  logo: { width: 500, height: 100, marginBottom: 24 },
  title: { fontSize: 20, fontFamily: 'Montserrat-Bold', marginBottom: 16, color: '#000' },
  subtitle: { fontSize: 16, opacity: 0.8, textAlign: 'center' },
  form: { gap: 12 },
  input: { width: '100%', backgroundColor: '#fff', borderRadius: 10, padding: 10, color: '#000' },
  primary: { width: '100%', height: 48, marginTop: 8, backgroundColor: 'rgba(140, 82, 255, 1)' },
  secondaryText: { width: '100%', height: 40, color: '#666', textAlign: 'center', fontWeight: '200', fontFamily: 'Montserrat-Bold' },
}); 