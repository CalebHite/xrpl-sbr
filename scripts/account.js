import axios from 'axios';
import Constants from 'expo-constants';

const API_BASE_URL = __DEV__ 
    ? Constants.expoConfig?.hostUri 
        ? `http://${Constants.expoConfig.hostUri.split(':').shift()}:3000`
        : 'http://localhost:3000'
    : 'http://your-production-api.com';

async function createUser(userName, password, name, phoneNumber) {
    try {
        if(!userName || !password || !name || !phoneNumber) {
            throw new Error('Missing required fields');
        }
        if(phoneNumber.length !== 10 || !/^\d+$/.test(phoneNumber)) {
            throw new Error('Invalid phone number. Format: 1234567890');
        }
        const response = await axios.post(`${API_BASE_URL}/user/`, {
            userName,
            password,
            name,
            phoneNumber: "+1" + phoneNumber
        });
        return response.data;
    } catch (error) {
        console.error('Failed to create user:', error);
        throw error;
    }
}

async function getUser(userName) {
    try {
        if(!userName) {
            throw new Error('Missing required fields');
        }
        const response = await axios.get(`${API_BASE_URL}/user/${userName}`);
        return response.data;
    } catch (error) {
        console.error('Failed to get user:', error);
        throw error;
    }
}

async function deleteUser(userId) {
    try {
        if(!userId) {
            throw new Error('Missing required fields');
        }
        const response = await axios.delete(`${API_BASE_URL}/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to delete user:', error);
        throw error;
    }
}

async function updateUser(userId, updates) {
    try {
        if(!userId || !updates) {
            throw new Error('Missing required fields');
        }
        const response = await axios.patch(`${API_BASE_URL}/user/${userId}`, updates);
        return response.data;
    } catch (error) {
        console.error('Failed to update user:', error);
        throw error;
    }
}

async function searchUsers(searchTerm) {
    try {
        if(!searchTerm) {
            throw new Error('Missing required fields');
        }
        const response = await axios.get(`${API_BASE_URL}/all-users/${searchTerm}`);
        return response.data;
    } catch (error) {
        console.error('Failed to search users:', error);
        throw error;
    }
}

async function login(userName, password) {
    try {
        if(!userName || !password) {
            throw new Error('Missing required fields');
        }
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            userName,
            password
        });
        
        const { user, access_token } = response.data.data;

        console.log(response.data.data);
        
        return {
            username: user.username,
            name: user.name,
            nickname: user.name,
            picture: user.picture,
            phone_number: user.phone_number || '',
            app_metadata: {
                xrp_address: user.app_metadata?.xrp_address || '',
                xrp_seed: user.app_metadata?.xrp_seed || '',
                xrp_public_key: user.app_metadata?.xrp_public_key || '',
                xrp_secret: user.app_metadata?.xrp_secret || '',
                friends: user.app_metadata?.friends || []
            }
        };
    } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw error;
    }
}

async function getBalance(address) {
    try {
        const response = await axios.get(`${API_BASE_URL}/user/balance/${address}`);
        return response.data;
    } catch (error) {
        console.error('Failed to get balance:', error);
        throw error;
    }
}

export {
    createUser, deleteUser, getBalance, getUser, login, searchUsers, updateUser
};



