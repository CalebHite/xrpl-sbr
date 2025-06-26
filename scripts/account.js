import axios from 'axios';
import Constants from 'expo-constants';

const API_BASE_URL = __DEV__ 
    ? Constants.expoConfig?.hostUri 
        ? `http://${Constants.expoConfig.hostUri.split(':').shift()}:3000`
        : 'http://localhost:3000'
    : 'http://your-production-api.com';

async function createUser(userName, password, name, phoneNumber) {
    try {
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
        const response = await axios.get(`${API_BASE_URL}/user/${userName}`);
        return response.data;
    } catch (error) {
        console.error('Failed to get user:', error);
        throw error;
    }
}

async function deleteUser(userId) {
    try {
        const response = await axios.delete(`${API_BASE_URL}/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to delete user:', error);
        throw error;
    }
}

async function updateUser(userId, updates) {
    try {
        const response = await axios.patch(`${API_BASE_URL}/user/${userId}`, updates);
        return response.data;
    } catch (error) {
        console.error('Failed to update user:', error);
        throw error;
    }
}

async function searchUsers(searchTerm) {
    try {
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



