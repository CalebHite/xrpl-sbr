"use client"

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useUser } from '../context/UserContext';

export default function Profile () {
  const [showFullAddress, setShowFullAddress] = useState(false)

  const user = useUser().user;

  const mockTransactions = [
    {
      id: "1",
      type: "sent",
      amount: 50.0,
      recipient: "Alice Smith",
      date: "2024-01-15",
      status: "completed",
    },
    {
      id: "2",
      type: "received",
      amount: 125.5,
      sender: "Bob Johnson",
      date: "2024-01-14",
      status: "completed",
    },
    {
      id: "3",
      type: "sent",
      amount: 25.0,
      recipient: "Charlie Brown",
      date: "2024-01-13",
      status: "pending",
    },
    {
      id: "4",
      type: "received",
      amount: 200.0,
      sender: "Diana Prince",
      date: "2024-01-12",
      status: "completed",
    },
  ];

  const handleFriendsPress = () => {
    Alert.alert("Friends", "Navigate to friends list screen")
  }

  const handleSettingsPress = () => {
    Alert.alert("Settings", "Navigate to settings screen")
  }

  const handleTransactionPress = (transaction: any) => {
    Alert.alert(
      "Transaction Details",
      `${transaction.type === "sent" ? "Sent to" : "Received from"}: ${
        transaction.recipient || transaction.sender
      }\nAmount: $${transaction.amount}\nDate: ${transaction.date}\nStatus: ${transaction.status}`,
    )
  }

  const truncateAddress = (address: string) => {
    if (showFullAddress) return address
    return `${address.slice(0, 8)}...${address.slice(-8)}`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Settings */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={handleSettingsPress} style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Profile Picture */}
        <View style={styles.profileSection}>
          <View style={styles.profilePictureContainer}>
            <Image source={{ uri: user?.picture }} style={styles.profilePicture} />
          </View>

          {/* Name and Username */}
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.username}>{user?.username}</Text>
        </View>

        {/* Account Balance */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Account Balance</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(0)}</Text>
        </View>

        {/* Friends Count */}
        <TouchableOpacity style={styles.friendsSection} onPress={handleFriendsPress}>
          <View style={styles.friendsContent}>
            <Ionicons name="people-outline" size={24} color="#007AFF" />
            <View style={styles.friendsText}>
              <Text style={styles.friendsCount}>{0}</Text>
              <Text style={styles.friendsLabel}>Friends</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </View>
        </TouchableOpacity>

        {/* XRPL Address */}
        <View style={styles.addressSection}>
          <Text style={styles.addressLabel}>XRPL Address</Text>
          <TouchableOpacity style={styles.addressContainer} onPress={() => setShowFullAddress(!showFullAddress)}>
            <Text style={styles.addressText}>{truncateAddress(user?.app_metadata?.xrp_address || "")}</Text>
            <Ionicons name={showFullAddress ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Transactions Section */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {mockTransactions.map((transaction) => (
            <TouchableOpacity
              key={transaction.id}
              style={styles.transactionItem}
              onPress={() => handleTransactionPress(transaction)}
            >
              <View style={styles.transactionIcon}>
                <Ionicons
                  name={transaction.type === "sent" ? "arrow-up" : "arrow-down"}
                  size={20}
                  color={transaction.type === "sent" ? "#FF3B30" : "#34C759"}
                />
              </View>

              <View style={styles.transactionDetails}>
                <Text style={styles.transactionTitle}>
                  {transaction.type === "sent"
                    ? `Sent to ${transaction.recipient}`
                    : `Received from ${transaction.sender}`}
                </Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>

              <View style={styles.transactionAmount}>
                <Text
                  style={[styles.transactionAmountText, { color: transaction.type === "sent" ? "#FF3B30" : "#34C759" }]}
                >
                  {transaction.type === "sent" ? "-" : "+"}
                  {formatCurrency(transaction.amount)}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: transaction.status === "completed" ? "#34C759" : "#FF9500" },
                  ]}
                >
                  <Text style={styles.statusText}>{transaction.status}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e5e9",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  settingsButton: {
    padding: 8,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  profilePictureContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: "#007AFF",
  },
  balanceSection: {
    backgroundColor: "#fff",
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#007AFF",
  },
  friendsSection: {
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  friendsContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  friendsText: {
    flex: 1,
    marginLeft: 16,
  },
  friendsCount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  friendsLabel: {
    fontSize: 14,
    color: "#666",
  },
  addressSection: {
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addressText: {
    fontSize: 14,
    fontFamily: "monospace",
    color: "#333",
    flex: 1,
  },
  transactionsSection: {
    backgroundColor: "#fff",
    paddingTop: 20,
    marginBottom: 80,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: "#666",
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
    textTransform: "capitalize",
  },
})
