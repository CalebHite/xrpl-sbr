import Constants from 'expo-constants';

const API_BASE_URL = __DEV__ 
    ? Constants.expoConfig?.hostUri 
        ? `http://${Constants.expoConfig.hostUri.split(':').shift()}:3000`
        : 'http://localhost:3000'
    : 'http://your-production-api.com';

const fetchVideos = async () => {
  try {
    console.log('Fetching videos from:', `${API_BASE_URL}/api/videos`);
    const response = await fetch(`${API_BASE_URL}/api/videos`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch videos');
    }

    return data.videos;
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
};

module.exports = {
  fetchVideos
}; 