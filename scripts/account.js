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

export {
    createUser, deleteUser, getUser, searchUsers, updateUser
};



