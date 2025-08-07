import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Montserrat-Variable',
    fontWeight: '500',
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Montserrat-Variable',
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Montserrat-Variable',
    fontWeight: '700',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-Variable',
    fontWeight: '600',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    fontFamily: 'Montserrat-Variable',
    fontWeight: '500',
    color: '#0a7ea4',
  },
});
