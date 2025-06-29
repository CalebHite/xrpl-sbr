"use client"

import { ThemedText } from "@/components/ThemedText"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"
import { Card, CardContent } from "@/components/ui/Card"
import { getBalance, searchUsers } from "@/scripts/account"
import { Feather, MaterialIcons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import { useUser } from "../context/UserContext"

interface UserProfile {
  id: string
  name: string
  username: string
  avatar: string
  xrplAddress: string
  isOnline?: boolean
  lastTransaction?: string
}

export default function SendPage() {
  const user = useUser().user;

  const [selectedRecipient, setSelectedRecipient] = useState<UserProfile | null>(null)
  const [amountXRP, setAmountXRP] = useState("")
  const [durationSeconds, setDurationSeconds] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: select user, 2: payment details, 3: success
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [balance, setBalance] = useState(0)
  const [recipientBalance, setRecipientBalance] = useState(0)

  // Load user balance
  useEffect(() => {
    const loadBalance = async () => {
      if (user?.app_metadata?.xrp_address) {
        try {
          const data = await getBalance(user.app_metadata.xrp_address)
          setBalance(data.data.balance)
        } catch (error) {
          console.error('Failed to load balance:', error)
        }
      }
    }
    loadBalance()
  }, [user?.app_metadata?.xrp_address])

  // Load recipient balance when selected
  useEffect(() => {
    const loadRecipientBalance = async () => {
      if (selectedRecipient?.xrplAddress) {
        try {
          const data = await getBalance(selectedRecipient.xrplAddress)
          setRecipientBalance(data.data.balance)
        } catch (error) {
          console.error('Failed to load recipient balance:', error)
        }
      }
    }
    loadRecipientBalance()
  }, [selectedRecipient?.xrplAddress])

  // Handle search
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true)
        setSearchError(null)
        try {
          const results = await searchUsers(searchQuery.trim())
          console.log('Search response:', results)
          
          // Check if results has the expected structure
          if (results?.success && Array.isArray(results.data)) {
            setSearchResults(results.data.map((user: any) => ({
              id: user.user_id,
              name: user.name,
              username: user.username || user.nickname,
              avatar: user.picture,
              xrplAddress: user.app_metadata?.xrp_address || '',
              isOnline: false
            })))
          } else {
            console.log('Unexpected response structure:', results)
            setSearchResults([])
            setSearchError('No results found')
          }
        } catch (error) {
          console.error('Search failed:', error)
          setSearchError('Failed to search users')
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
      }
    }, 500)

    return () => clearTimeout(searchTimeout)
  }, [searchQuery])

  const handleUserSelect = (user: UserProfile) => {
    setSelectedRecipient(user)
    setStep(2)
  }

  const handleSend = async () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setStep(3)
    }, 2000)
  }

  const resetForm = () => {
    setSelectedRecipient(null)
    setAmountXRP("")
    setDurationSeconds("")
    setSearchQuery("")
    setStep(1)
  }

  const goBack = () => {
    if (step === 2) {
      setStep(1)
    } else if (step === 3) {
      resetForm()
    }
  }

  if (step === 3) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.content}>
          <View style={styles.successContainer}>
            <Card style={styles.card}>
              <CardContent style={styles.cardContent}>
                <View style={styles.successIconContainer}>
                  <MaterialIcons name="check" size={32} color="#16A34A" />
                </View>
                <ThemedText style={styles.title}>Payment Sent!</ThemedText>
                <ThemedText style={styles.subtitle}>
                  You sent <Text style={styles.bold}>{amountXRP} XRP</Text> to
                </ThemedText>
                <View style={styles.recipientContainer}>
                  <Avatar style={styles.avatarContainer}>
                    <AvatarImage uri={selectedRecipient?.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      <MaterialIcons name="person" size={20} color="#6B7280" />
                    </AvatarFallback>
                  </Avatar>
                  <View style={styles.recipientInfo}>
                    <ThemedText style={styles.recipientName}>{selectedRecipient?.name}</ThemedText>
                    <ThemedText style={styles.username}>@{selectedRecipient?.username}</ThemedText>
                  </View>
                </View>
                <Pressable 
                  style={[styles.button, styles.primaryButton]} 
                  onPress={resetForm}
                >
                  <ThemedText style={styles.buttonText}>Send Another Payment</ThemedText>
                </Pressable>
              </CardContent>
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  if (step === 2) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Pressable 
              style={styles.ghostButton} 
              onPress={goBack}
            >
              <View style={{ transform: [{ scaleX: -1 }] }}>
                <MaterialIcons name="arrow-forward" size={20} color="#333" />
              </View>
            </Pressable>
            <ThemedText style={styles.headerTitle}>Payment Details</ThemedText>
            <Badge variant="secondary" style={styles.balanceBadge}>
              <ThemedText style={styles.badgeText}>Balance: {balance} XRP</ThemedText>
            </Badge>
          </View>
        </View>

        <ScrollView style={styles.content}>
          <Card style={styles.recipientCard}>
            <CardContent style={styles.cardContent}>
              <View style={styles.recipientRow}>
                <Avatar style={styles.avatarContainer}>
                  <AvatarImage uri={selectedRecipient?.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    <MaterialIcons name="person" size={20} color="#6B7280" />
                  </AvatarFallback>
                </Avatar>
                <View style={styles.recipientInfo}>
                  <ThemedText style={styles.recipientName}>{selectedRecipient?.name}</ThemedText>
                  <ThemedText style={styles.username}>@{selectedRecipient?.username}</ThemedText>
                </View>
                <Pressable 
                  style={[styles.button, styles.outlineButton]} 
                  onPress={goBack}
                >
                  <ThemedText style={styles.outlineButtonText}>Change</ThemedText>
                </Pressable>
              </View>
            </CardContent>
          </Card>

          <Card style={styles.formCard}>
            <CardContent style={styles.cardContent}>
              <View style={styles.inputContainer}>
                <View style={styles.labelContainer}>
                  <MaterialIcons name="attach-money" size={16} color="#4B5563" />
                  <ThemedText style={styles.label}>Amount (XRP)</ThemedText>
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput
                    placeholder="0.00"
                    value={amountXRP}
                    onChangeText={setAmountXRP}
                    style={styles.input}
                    keyboardType="numeric"
                  />
                  <ThemedText style={styles.inputSuffix}>XRP</ThemedText>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.labelContainer}>
                  <MaterialIcons name="access-time" size={16} color="#4B5563" />
                  <ThemedText style={styles.label}>Handshake Duration (seconds)</ThemedText>
                </View>
                <TextInput
                  placeholder="Enter duration..."
                  value={durationSeconds}
                  onChangeText={setDurationSeconds}
                  style={styles.input}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.quickAmounts}>
                <ThemedText style={styles.label}>Quick amounts</ThemedText>
                <View style={styles.quickAmountButtons}>
                  {["10", "25", "50", "100"].map((amount) => (
                    <Pressable
                      key={amount}
                      style={[styles.button, styles.outlineButton, styles.quickAmountButton]}
                      onPress={() => setAmountXRP(amount)}
                    >
                      <ThemedText style={styles.outlineButtonText}>{amount}</ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>
            </CardContent>
          </Card>

          <Pressable
            style={[
              styles.button,
              styles.primaryButton,
              styles.sendButton,
              (!amountXRP || !durationSeconds || isLoading) && styles.disabledButton
            ]}
            onPress={handleSend}
            disabled={!amountXRP || !durationSeconds || isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="white" />
                <ThemedText style={styles.buttonText}>Sending...</ThemedText>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <ThemedText style={styles.buttonText}>Send {amountXRP || "0"} XRP</ThemedText>
                <MaterialIcons name="arrow-forward" size={20} color="white" />
              </View>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    )
  }

  // Step 1: User Selection
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Send to</ThemedText>
          <Badge variant="secondary" style={styles.balanceBadge}>
            <ThemedText style={styles.badgeText}>Balance: {balance} XRP</ThemedText>
          </Badge>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchIcon}>
            <Feather name="search" size={16} color="#9CA3AF" />
          </View>
          <TextInput
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {searchQuery === "" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="access-time" size={16} color="#4B5563" />
              <ThemedText style={styles.sectionTitle}>Recent</ThemedText>
            </View>
            <View style={styles.noResults}>
              <MaterialIcons name="history" size={48} color="#D1D5DB" />
              <ThemedText style={styles.noResultsTitle}>No recent transactions</ThemedText>
              <ThemedText style={styles.noResultsSubtitle}>
                Your recent transactions will appear here
              </ThemedText>
            </View>
          </View>
        )}

        {searchQuery !== "" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="search" size={16} color="#4B5563" />
              <ThemedText style={styles.sectionTitle}>Search Results</ThemedText>
              {!isSearching && (
                <Badge variant="secondary" style={styles.countBadge}>
                  <ThemedText>{searchResults.length}</ThemedText>
                </Badge>
              )}
            </View>

            {isSearching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <ThemedText style={styles.loadingText}>Searching users...</ThemedText>
              </View>
            ) : searchError ? (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error" size={24} color="#EF4444" />
                <ThemedText style={styles.errorText}>{searchError}</ThemedText>
              </View>
            ) : searchResults.length > 0 ? (
              searchResults.map((user) => (
                <Pressable key={user.id} onPress={() => handleUserSelect(user)}>
                  <Card style={styles.userCard}>
                    <CardContent style={styles.cardContent}>
                      <View style={styles.userRow}>
                        <Avatar style={styles.avatarContainer}>
                          <AvatarImage uri={user.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            <MaterialIcons name="person" size={20} color="#6B7280" />
                          </AvatarFallback>
                        </Avatar>
                        <View style={styles.userInfo}>
                          <ThemedText style={styles.userName}>{user.name}</ThemedText>
                          <ThemedText style={styles.username}>@{user.username}</ThemedText>
                        </View>
                        <MaterialIcons name="arrow-forward" size={16} color="#9CA3AF" />
                      </View>
                    </CardContent>
                  </Card>
                </Pressable>
              ))
            ) : (
              <View style={styles.noResults}>
                <MaterialIcons name="person" size={48} color="#D1D5DB" />
                <ThemedText style={styles.noResultsTitle}>No users found</ThemedText>
                <ThemedText style={styles.noResultsSubtitle}>
                  Try searching with a different name or username
                </ThemedText>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e5e9",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    top: 12,
    left: 24,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingLeft: 36,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userCard: {
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  cardContent: {
    padding: 16,
  },
  avatarWrapper: {
    position: "relative",
    width: 40,
    height: 40,
  },
  avatarContainer: {
    width: 40,
    height: 40,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 6,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  username: {
    fontSize: 14,
    color: "#007AFF",
  },
  timestamp: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    padding: 16,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  ghostButton: {
    padding: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  outlineButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "500",
  },
  balanceBadge: {
    backgroundColor: "#DBEAFE",
  },
  badgeText: {
    fontSize: 12,
    color: "#1D4ED8",
  },
  countBadge: {
    marginLeft: 8,
    backgroundColor: "#DBEAFE",
  },
  inputContainer: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginLeft: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  inputSuffix: {
    fontSize: 16,
    color: "#6B7280",
    marginLeft: 8,
  },
  quickAmounts: {
    marginTop: 16,
  },
  quickAmountButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  quickAmountButton: {
    flex: 1,
    marginHorizontal: 4,
    height: 40,
  },
  sendButton: {
    height: 56,
    marginTop: 24,
    marginBottom: 24,
  },
  disabledButton: {
    opacity: 0.5,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  noResults: {
    alignItems: "center",
    paddingVertical: 32,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 4,
    color: "#333",
  },
  noResultsSubtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  successContainer: {
    flex: 1,
    paddingTop: 32,
  },
  successIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: "#E5F7ED",
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    alignSelf: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 8,
  },
  bold: {
    fontWeight: "600",
  },
  recipientContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  recipientInfo: {
    marginLeft: 12,
  },
  recipientName: {
    fontWeight: "600",
    fontSize: 16,
    color: "#333",
  },
  formCard: {
    marginBottom: 24,
  },
  recipientCard: {
    marginBottom: 24,
  },
  recipientRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#007AFF",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fef2f2",
    borderRadius: 8,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#EF4444",
    marginLeft: 8,
  },
})
