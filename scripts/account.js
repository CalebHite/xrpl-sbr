import axios from 'axios';
import Constants from 'expo-constants';

const API_BASE_URL = __DEV__ 
    ? Constants.expoConfig?.hostUri 
        ? `http://${Constants.expoConfig.hostUri.split(':').shift()}:3000`
        : 'http://localhost:3000'
    : 'http://your-production-api.com';

async function createUser(username, password, email) {
    try {
        if(!username || !password) {
            throw new Error('Missing required fields');
        }
        const response = await axios.post(`${API_BASE_URL}/register`, {
            username,
            password,
            email,
            theme: 'light',
            notifications: true
        });
        return response.data.user;
    } catch (error) {
        console.error('Failed to create user:', error);
        throw error;
    }
}

async function getUser(userId) {
    try {
        const endpoint = userId 
            ? `${API_BASE_URL}/api/user/${userId}/metadata`
            : `${API_BASE_URL}/api/user/metadata`;
        const response = await axios.get(endpoint);
        console.log('getUser response:', response.data.metadata);
        return response.data;
    } catch (error) {
        console.error('Failed to get user:', error);
        throw error;
    }
}

async function updateUser(updates) {
    try {
        if(!updates) {
            throw new Error('Missing required fields');
        }
        const response = await axios.put(`${API_BASE_URL}/api/user/metadata`, updates);
        return response.data;
    } catch (error) {
        console.error('Failed to update user:', error);
        throw error;
    }
}

async function followUser(userId) {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/user/follow/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to follow user:', error);
        throw error;
    }
}

async function unfollowUser(userId) {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/user/unfollow/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to unfollow user:', error);
        throw error;
    }
}

async function login(username, password) {
    try {
        if(!username || !password) {
            throw new Error('Missing required fields');
        }
        const response = await axios.post(`${API_BASE_URL}/login`, {
            username,
            password
        });
        
        return response.data.user;
    } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
            throw new Error(error.response.data.error);
        }
        throw error;
    }
}

async function logout() {
    try {
        const response = await axios.get(`${API_BASE_URL}/logout`);
        return response.data;
    } catch (error) {
        console.error('Failed to logout:', error);
        throw error;
    }
}

async function addVideo(videoUrl) {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/user/videos`, {
            videoUrl
        });
        return response.data;
    } catch (error) {
        console.error('Failed to add video:', error);
        throw error;
    }
}

async function getVideos(userId) {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/user/${userId}/videos`);
        return response.data;
    } catch (error) {
        console.error('Failed to get videos:', error);
        throw error;
    }
}

async function incrementViews(userId) {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/user/${userId}/increment-views`);
        return response.data;
    } catch (error) {
        console.error('Failed to increment views:', error);
        throw error;
    }
}

async function incrementTrades(userId) {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/user/${userId}/increment-trades`);
        return response.data;
    } catch (error) {
        console.error('Failed to increment trades:', error);
        throw error;
    }
}

export {
    addVideo,
    createUser,
    followUser, getUser, getVideos, incrementTrades,
    incrementViews,
    login,
    logout,
    unfollowUser,
    updateUser
};



