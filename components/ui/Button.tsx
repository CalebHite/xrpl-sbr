import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  style?: any;
}

export function Button({ 
  children, 
  variant = 'default', 
  size = 'default',
  style,
  disabled,
  ...props 
}: ButtonProps) {
  const backgroundColor = useThemeColor(
    { 
      light: variant === 'default' ? '#007AFF' : '#ffffff',
      dark: variant === 'default' ? '#0A84FF' : '#1a1a1a'
    }, 
    'background'
  );
  
  const textColor = useThemeColor(
    { 
      light: variant === 'default' ? '#ffffff' : '#000000',
      dark: variant === 'default' ? '#ffffff' : '#ffffff'
    }, 
    'text'
  );

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor,
          opacity: disabled ? 0.5 : 1,
          height: size === 'sm' ? 36 : size === 'lg' ? 48 : 40,
        },
        style,
      ]}
      disabled={disabled}
      {...props}
    >
      <Text style={[styles.text, { color: textColor }]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});

