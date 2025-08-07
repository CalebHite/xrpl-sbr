import { useUser } from '@/app/context/UserContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/ui/Card';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { createBuyOrder, createSellOrder, fetchOrders } from '@/scripts/trade';
import { LinearGradient } from 'expo-linear-gradient';

interface Order {
  status: string;
  _id: string;
  mptIssuanceId: string;
  amount: number;
  tokenId: string;
  timeOutDuration: number;
  createdAt: string;
  updatedAt: string;
}

interface OrdersResponse {
  success: boolean;
  orders: {
    buy: Order[];
    sell: Order[];
  };
}

export default function Trade() {
  const { user } = useUser();
  const [orders, setOrders] = React.useState<OrdersResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadOrders = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleFulfillOrder = async (order: Order, isBuyOrder: boolean) => {
    if (!user?.metadata.wallet.seed) {
      setError('Wallet seed not found. Please log in again.');
      return;
    }

    // Extract video name and creator from tokenId
    const [creator, ...nameParts] = order.tokenId.split(':');
    const videoName = nameParts.join(':');
    const orderType = isBuyOrder ? 'sell' : 'buy';
    
    Alert.alert(
      `Confirm ${orderType.toUpperCase()} Order`,
      `Are you sure you want to create a ${orderType} order for:\n\n` +
      `Video: ${videoName}\n` +
      `Creator: ${creator}\n` +
      `Amount: ${order.amount} XRP\n` +
      `Order Duration: ${order.timeOutDuration / 3600} hours`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              setIsLoading(true);
              const orderData = {
                xrplSeed: user.metadata.wallet.seed,
                mptIssuanceId: order.mptIssuanceId,
                amount: order.amount,
                tokenId: order.tokenId,
                timeOutDuration: order.timeOutDuration,
              };

              if (isBuyOrder) {
                await createSellOrder(orderData);
              } else {
                await createBuyOrder(orderData);
              }

              // Refresh the orders list
              await loadOrders();
            } catch (err: any) {
              setError(err.message || 'Failed to fulfill order');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderOrder = (order: Order, isBuyOrder: boolean) => {
    if (order.status !== 'pending') return null;
    
    return (
      <Card key={order._id} style={styles.orderCard}>
        <View style={styles.orderContent}>
          <ThemedText style={styles.orderAmount}>Amount: {order.amount} XRP</ThemedText>
          <ThemedText style={styles.orderDetail}>Token: {order.tokenId.split(':')[1]}</ThemedText>
          <ThemedText style={styles.orderDetail}>
            Created: {new Date(order.createdAt).toLocaleString()}
          </ThemedText>
        </View>
        <TouchableOpacity 
          onPress={() => handleFulfillOrder(order, isBuyOrder)}
          disabled={isLoading}>
          <LinearGradient
            colors={['rgba(140, 82, 255, 1)', 'rgba(166, 220, 255, 1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.fulfillButton, isLoading && styles.disabledButton]}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <MaterialIcons name="swap-horiz" size={32} color="#ffffff" />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText style={styles.error}>{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Image source={require('@/assets/images/virl_logo_dark.png')} style={styles.logo} />
      <ScrollArea>
        <View style={styles.section}>
          <ThemedText style={styles.title}>Buy Orders</ThemedText>
          {orders?.orders.buy.some(order => order.status === 'pending') ? (
            orders.orders.buy.map(order => renderOrder(order, true))
          ) : (
            <ThemedText style={styles.placeholder}>No active buy orders</ThemedText>
          )}
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.title}>Sell Orders</ThemedText>
          {orders?.orders.sell.some(order => order.status === 'pending') ? (
            orders.orders.sell.map(order => renderOrder(order, false))
          ) : (
            <ThemedText style={styles.placeholder}>No active sell orders</ThemedText>
          )}
        </View>
      </ScrollArea>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 75,
    height: 75,
    marginVertical: 32,
  },
  orderContent: {
    flex: 1,
    marginBottom: 12,
  },
  fulfillButton: {
    marginTop: 8,
    overflow: 'hidden',
    borderRadius: 25,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    alignSelf: 'flex-end',
  },
  disabledButton: {
    opacity: 0.5,
  },
  container: {
    marginTop: 16,
    flex: 1,
    padding: 16,
    backgroundColor: '#101010',   
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
    marginBottom: 16,
    color: '#ffffff',
  },
  orderCard: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#101010',
    borderRadius: 16,
    borderColor: '#ffffff',
    borderWidth: 1,
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#ffffff',
    fontFamily: 'Montserrat-Bold',
  },
  orderDetail: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.8,
  },
  placeholder: {
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.5,
  },
  error: {
    color: '#ff4444',
    textAlign: 'center',
  },
});