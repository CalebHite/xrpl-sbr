import axios from 'axios';
import Constants from 'expo-constants';

const API_BASE_URL = __DEV__ 
    ? Constants.expoConfig?.hostUri 
        ? `http://${Constants.expoConfig.hostUri.split(':').shift()}:3000`
        : 'http://localhost:3000'
    : 'http://your-production-api.com';


export async function sendXRP(senderSeed, recipientAddress, amountXRP, durationSeconds) {
    try {
        const response = await axios.post(`${API_BASE_URL}/deploy-handshake`, {
            senderSeed,
            recipientAddress,
            amountXRP,
            durationSeconds
        });
        return response.data;
    } catch (error) {
        console.error('Failed to send XRP:', error);
        throw error;
    }
}