import React, { useEffect } from 'react';
import { Animated, Easing, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { IconSymbol } from './IconSymbol';

export type LoaderProps = {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export function Loader({ size = 28, color = '#9583fe', style }: LoaderProps) {
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    rotateAnim.setValue(0);
    const loop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <IconSymbol name="arrow.triangle.2.circlepath" size={size} color={color} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Loader;

