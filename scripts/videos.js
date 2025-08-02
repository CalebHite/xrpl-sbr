import Constants from 'expo-constants';

const API_BASE_URL = __DEV__ 
    ? Constants.expoConfig?.hostUri 
        ? `http://${Constants.expoConfig.hostUri.split(':').shift()}:3000`
        : 'http://localhost:3000'
    : 'http://your-production-api.com';

export const fetchVideos = async () => {
  try {
    console.log('Fetching videos from:', `${API_BASE_URL}/api/videos`);
    const response = await fetch(`${API_BASE_URL}/api/videos`, {
      credentials: 'include'
    });
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch videos');
    }

    console.log('Fetched videos:', data.videos);
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

export const getComments = async ({ videoId }) => {
  try {
    const videoResponse = await fetch(`${API_BASE_URL}/api/videos/${videoId}`, {
      credentials: 'include'
    });
    const videoData = await videoResponse.json();
    
    if (!videoData.success || !videoData.video) {
      console.error('Failed to fetch video details:', videoData);
      throw new Error('Video not found');
    }

    const mongoId = videoData.video._id;
    console.log('Found video:', { videoId, mongoId, video: videoData.video });

    // Now fetch the comments using the MongoDB ID
    const response = await fetch(`${API_BASE_URL}/api/videos/${mongoId}/comments`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data.comments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
}

export const addComment = async ({ videoId, comment }) => {
  try {
    const videoResponse = await fetch(`${API_BASE_URL}/api/videos/${videoId}`, {
      credentials: 'include'
    });
    const videoData = await videoResponse.json();
    
    if (!videoData.success || !videoData.video) {
      console.error('Failed to fetch video details:', videoData);
      throw new Error('Video not found');
    }

    const mongoId = videoData.video._id;
    console.log('Found video:', { videoId, mongoId, video: videoData.video });
    console.log('Existing comments:', videoData.comments);
    
    const response = await fetch(`${API_BASE_URL}/api/videos/${mongoId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: comment }),
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Server response:', data);
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to add comment');
    }

    if (!data.comment || !data.comment._id || !data.comment.userId) {
      console.error('Invalid comment data:', data);
      throw new Error('Invalid comment data received from server');
    }

    const formattedComment = {
      _id: data.comment._id,
      userId: {
        _id: data.comment.userId._id,
        username: data.comment.userId.username,
        metadata: {
          profile: {
            avatar: data.comment.userId.metadata?.profile?.avatar || ''
          }
        }
      },
      text: data.comment.text,
      createdAt: new Date(data.comment.createdAt)
    };

    console.log('Formatted comment:', formattedComment);
    return formattedComment;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};