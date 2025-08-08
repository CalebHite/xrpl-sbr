import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';

export default function SolidTabBarBackground() {
  return <View style={[StyleSheet.absoluteFill, { backgroundColor: '#101010' }]} />;
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
