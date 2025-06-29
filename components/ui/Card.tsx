import * as React from "react"
import { StyleSheet, View, ViewProps } from "react-native"

const Card = React.forwardRef<View, ViewProps>(({ style, ...props }, ref) => (
  <View
    ref={ref}
    style={[styles.card, style]}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<View, ViewProps>(({ style, ...props }, ref) => (
  <View
    ref={ref}
    style={[styles.cardHeader, style]}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardContent = React.forwardRef<View, ViewProps>(({ style, ...props }, ref) => (
  <View
    ref={ref}
    style={[styles.cardContent, style]}
    {...props}
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<View, ViewProps>(({ style, ...props }, ref) => (
  <View
    ref={ref}
    style={[styles.cardFooter, style]}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardHeader: {
    padding: 16,
  },
  cardContent: {
    padding: 16,
    paddingTop: 0,
  },
  cardFooter: {
    padding: 16,
    paddingTop: 0,
    flexDirection: "row",
    alignItems: "center",
  },
})

export { Card, CardContent, CardFooter, CardHeader }

