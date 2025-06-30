"use client"

import { getBalance, getUser, updateUser } from '@/scripts/account';
import { Ionicons } from "@expo/vector-icons";
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from "react";
import { Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useUser } from '../context/UserContext';

const API_BASE_URL = __DEV__ 
    ? Constants.expoConfig?.hostUri 
        ? `http://${Constants.expoConfig.hostUri.split(':').shift()}:3000`
        : 'http://localhost:3000'
    : 'http://your-production-api.com';

interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: number;
  date: string;
  status: 'completed' | 'pending';
  recipient?: string;
  sender?: string;
}

interface Friend {
  name: string;
  username: string;
  picture: string;
}

export default function Profile () {
  const [showFullAddress, setShowFullAddress] = useState(false)
  const [balance, setBalance] = useState(0);
  const [showFriends, setShowFriends] = useState(false);
  const [friendsData, setFriendsData] = useState<Friend[]>([]);
  const [friendsCount, setFriendsCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);


  const user = useUser().user;

  const [image, setImage] = useState<string | undefined>(user?.picture);


  const mockTransactions: Transaction[] = [
  ];

  const convertImageToBase64 = async (uri: string) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error('Error converting image:', error);
      throw error;
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5, // Reduced quality to keep base64 string smaller
    });
  
    if (!result.canceled) {
      try {
        setImage(result.assets[0].uri);
        const base64Image = await convertImageToBase64(result.assets[0].uri);
        console.log(base64Image);
        
        if (user?.username) {
          await updateUser(user.username, {
            picture: base64Image,
            name: user.name,
            phone_number: user.phone_number
          });
          console.log("User updated with base64 image");
        }
      } catch (error) {
        console.error('Failed to update profile picture:', error);
        Alert.alert('Error', 'Failed to update profile picture');
        setImage(user?.picture); // Revert to original image on failure
      }
    }
  };

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

  useEffect(() => {
    getBalance(user?.app_metadata?.xrp_address || "").then((data) => {
      setBalance(data.data.balance);
    });

    console.log(user?.app_metadata?.friends);

    if (user?.app_metadata?.friends) {
      Promise.all(user.app_metadata.friends.map(async friend => {
        const data = await getUser(friend);
        return data;
      })).then(responses => {
        setFriendsData(responses.map(response => response.data));
        setFriendsCount(responses.length);
        console.log(friendsData);
      });
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {showFriends ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.friendsHeader}>
            <TouchableOpacity onPress={()=>{setShowFriends(false)}}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Friends</Text>
          </View>
          {friendsData.map((friend, index) => (
            <View key={index} style={styles.friendItem}>
              <View style={styles.friendInfo}>
                <Image source={{ uri: friend.picture }} style={styles.friendAvatar} />
              <View style={styles.friendNameContainer}>
                <Text style={styles.friendName}>{friend.name}</Text>
                <Text style={styles.friendUsername}>@{friend.username}</Text>
              </View>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : 

      showSettings ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={()=>{setShowSettings(false)}}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Settings</Text>
          </View>
        </ScrollView>
      ) : (
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Settings */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={()=>{setShowSettings(!showSettings)}} style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Profile Picture */}
        <View style={styles.profileSection}>
          <View style={styles.profilePictureContainer}>
            <Image source={{ uri: image || user?.picture }} style={styles.profilePicture} />
            <TouchableOpacity style={styles.changeAvatarButton} onPress={()=>{pickImage()}}>
              <Ionicons name="camera-outline" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Name and Username */}
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.username}>{user?.username}</Text>
        </View>

        {/* Account Balance */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Account Balance</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
        </View>

        {/* Friends Count */}
        <TouchableOpacity style={styles.friendsSection} onPress={()=>{setShowFriends(!showFriends)}}>
          <View style={styles.friendsContent}>
            <Ionicons name="people-outline" size={24} color="#007AFF" />
            <View style={styles.friendsText}>
              <Text style={styles.friendsCount}>{friendsCount}</Text>
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
      )}
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
  friendItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  friendInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  friendsHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    gap: 16,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  friendNameContainer: {
    flexDirection: "column",
  },
  friendName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  friendUsername: {
    fontSize: 14,
    color: "#007AFF",
    marginTop: 2,
  },
  changeAvatarButton: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 100,
    padding: 8,
  },
})
