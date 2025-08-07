import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import UserProvider, { useUser } from './context/UserContext';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user } = useUser();

  useEffect(() => {
    const init = async () => {
      try {
        if (!user) {
          await router.replace('/login');
        } else {
          await router.replace('/(tabs)/explore');
        }
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error('Navigation error:', error);
        await SplashScreen.hideAsync();
      }
    };

    init();
  }, [user]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    'Montserrat': require('../assets/fonts/Montserrat-Regular.ttf'),
    'Montserrat-Variable': require('../assets/fonts/Montserrat-VariableFont_wght.ttf'),
    'Montserrat-Italic': require('../assets/fonts/Montserrat-Italic-VariableFont_wght.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <UserProvider>
      <RootLayoutNav />
    </UserProvider>
  );
}
