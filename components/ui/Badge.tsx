import * as React from "react"
import { StyleSheet, View, ViewProps } from "react-native"

interface BadgeProps extends ViewProps {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ style, variant = "default", ...props }: BadgeProps) {
  return (
    <View 
      style={[
        styles.badge,
        variant === "secondary" && styles.secondary,
        variant === "destructive" && styles.destructive,
        variant === "outline" && styles.outline,
        style
      ]} 
      {...props} 
    />
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 2,
    backgroundColor: "#2563EB",
  },
  secondary: {
    backgroundColor: "#F3F4F6",
  },
  destructive: {
    backgroundColor: "#EF4444",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
})

export { Badge }
export type { BadgeProps }

