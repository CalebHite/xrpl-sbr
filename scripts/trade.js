import Constants from 'expo-constants';


const API_BASE_URL = __DEV__ 
    ? Constants.expoConfig?.hostUri 
        ? `http://${Constants.expoConfig.hostUri.split(':').shift()}:3000`
        : 'http://localhost:3000'
    : 'http://your-production-api.com';

async function createBuyOrder(orderData) {
  const response = await fetch(`${API_BASE_URL}/api/trade/buy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, */*;q=0.8'
    },
    credentials: 'include',
    body: JSON.stringify(orderData),
  });
  
  // Log detailed response information
  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));
  const responseText = await response.text();
  console.log('Response body:', responseText);

  // Try to parse as JSON if it's not an error response
  if (!response.ok) {
    console.error('Error response received:', responseText);
    throw new Error(`Failed to create buy order: ${response.status} ${responseText.slice(0, 200)}`);
  }

  try {
    return JSON.parse(responseText);
  } catch (e) {
    console.error('Failed to parse response as JSON:', e);
    throw new Error(`Invalid JSON response: ${responseText.slice(0, 200)}`);
  }
}

async function createSellOrder(orderData) {
  const response = await fetch(`${API_BASE_URL}/api/trade/sell`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, */*;q=0.8'
    },
    credentials: 'include',
    body: JSON.stringify(orderData),
  });

  // Log detailed response information
  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));
  const responseText = await response.text();
  console.log('Response body:', responseText);

  // Try to parse as JSON if it's not an error response
  if (!response.ok) {
    console.error('Error response received:', responseText);
    throw new Error(`Failed to create sell order: ${response.status} ${responseText.slice(0, 200)}`);
  }

  try {
    return JSON.parse(responseText);
  } catch (e) {
    console.error('Failed to parse response as JSON:', e);
    throw new Error(`Invalid JSON response: ${responseText.slice(0, 200)}`);
  }
}

function isValidTradeAmount(amount) {
  const numAmount = Number(amount);
  return !isNaN(numAmount) && numAmount > 0;
}

async function fetchOrders() {
  const response = await fetch(`${API_BASE_URL}/api/trade/orders`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json, */*;q=0.8'
    },
    credentials: 'include',
  });

  // Log detailed response information
  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));
  const responseText = await response.text();
  console.log('Response body:', responseText);

  // Try to parse as JSON if it's not an error response
  if (!response.ok) {
    console.error('Error response received:', responseText);
    throw new Error(`Failed to fetch orders: ${response.status} ${responseText.slice(0, 200)}`);
  }

  try {
    return JSON.parse(responseText);
  } catch (e) {
    console.error('Failed to parse response as JSON:', e);
    throw new Error(`Invalid JSON response: ${responseText.slice(0, 200)}`);
  }
}

export {
  createBuyOrder,
  createSellOrder, fetchOrders, isValidTradeAmount
};

