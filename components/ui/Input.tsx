import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  style?: any;
}

const styles = StyleSheet.create({
  input: {
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
});

export const Input = React.forwardRef<TextInput, InputProps>((props, ref) => {
  const { style, ...otherProps } = props;
  const backgroundColor = '#1a1a1a';
  const textColor = '#ffffff';
  const placeholderColor = '#999999';
  const borderColor = '#333333';

  return (
    <TextInput
      ref={ref}
      style={[
        styles.input,
        {
          backgroundColor,
          color: textColor,
          borderColor,
        },
        style,
      ]}
      placeholderTextColor={placeholderColor}
      keyboardAppearance="light"
      autoCapitalize="none"
      {...otherProps}
    />
  );
});

Input.displayName = 'Input';

