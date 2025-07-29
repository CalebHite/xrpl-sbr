import Constants from 'expo-constants';

const API_BASE_URL = __DEV__ 
    ? Constants.expoConfig?.hostUri 
        ? `http://${Constants.expoConfig.hostUri.split(':').shift()}:3000`
        : 'http://localhost:3000'
    : 'http://your-production-api.com';

export const fetchVideos = async () => {
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

export const createVideo = async ({ videoUri, title, description }) => {
  try {
    // TODO: switch to uploading video to IPFS
    const videoUrl = videoUri; 

    const userResponse = await fetch(`${API_BASE_URL}/api/user/metadata`);
    const userData = await userResponse.json();
    
    if (!userData.metadata?.wallet?.seed) {
      throw new Error('No wallet found for user');
    }

    // Mint the video token
    const response = await fetch(`${API_BASE_URL}/api/mint-video-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoUrl,
        title,
        description,
        seed: userData.metadata.wallet.seed
      }),
      credentials: 'include' // Important for session cookies
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to create video');
    }

    return data;
  } catch (error) {
    console.error('Error creating video:', error);
    throw error;
  }
}; 

export const addComment = async ({ videoId, comment }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment }),
    });
    const data = await response.json();
    return data.comment;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};