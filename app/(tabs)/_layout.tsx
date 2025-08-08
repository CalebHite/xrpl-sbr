import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useUser } from '../context/UserContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useUser();

  if (!user) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarShowLabel: false,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: '#101010',
            height: 100,
            borderTopWidth: 0,
            paddingTop: 20,
          },
          default: {
            backgroundColor: '#101010',
            height: 100,
            borderTopWidth: 0,
            paddingTop: 20,
          },
        }),
      }}>
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="globe" color={color} />,
        }}
      />
      <Tabs.Screen
        name="trade"
        options={{
          title: 'Trade',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="arrow.right.arrow.left" color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color, focused }) => (
            <LinearGradient
              colors={['rgba(140, 82, 255, 1)', 'rgba(166, 220, 255, 1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOpacity: 0.25,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 3 },
                elevation: 6,
              }}
            >
              <IconSymbol size={34} name="plus" color="#ffffff" />
            </LinearGradient>
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="envelope.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
