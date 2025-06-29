"use client"

import * as React from "react"
import { Image, ImageProps, StyleSheet, View, ViewProps } from "react-native"

interface AvatarProps extends ViewProps {
  size?: number
}

const Avatar = React.forwardRef<View, AvatarProps>(({ style, size = 40, ...props }, ref) => (
  <View
    ref={ref}
    style={[
      styles.avatar,
      { width: size, height: size, borderRadius: size / 2 },
      style
    ]}
    {...props}
  />
))
Avatar.displayName = "Avatar"

interface AvatarImageProps extends Omit<ImageProps, "source"> {
  uri: string
}

const AvatarImage = React.forwardRef<Image, AvatarImageProps>(({ style, uri, ...props }, ref) => (
  <Image
    ref={ref}
    source={{ uri }}
    style={[styles.image, style]}
    {...props}
  />
))
AvatarImage.displayName = "AvatarImage"

interface AvatarFallbackProps extends ViewProps {
  backgroundColor?: string
}

const AvatarFallback = React.forwardRef<View, AvatarFallbackProps>(
  ({ style, backgroundColor = "#F3F4F6", ...props }, ref) => (
    <View
      ref={ref}
      style={[styles.fallback, { backgroundColor }, style]}
      {...props}
    />
  )
)
AvatarFallback.displayName = "AvatarFallback"

const styles = StyleSheet.create({
  avatar: {
    position: "relative",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  fallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
})

export { Avatar, AvatarFallback, AvatarImage }
export type { AvatarFallbackProps, AvatarImageProps, AvatarProps }

