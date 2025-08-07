import React from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';

interface ScrollAreaProps extends ScrollViewProps {
  children: React.ReactNode;
}

export function ScrollArea({ children, ...props }: ScrollAreaProps) {
  return (
    <ScrollView {...props}>
      {children}
    </ScrollView>
  );
}