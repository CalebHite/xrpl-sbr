import { addComment } from '@/scripts/videos';
import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { Avatar, AvatarImage } from './Avatar';
import { Input } from './Input';

interface Comment {
  _id: string;
  userId: {
    _id: string;
    username: string;
    metadata: {
      profile: {
        avatar: string;
      }
    }
  };
  text: string;
  createdAt: Date;
}

interface CommentSectionProps {
  videoId: string;
  comments: Comment[];
  onCommentAdded?: (newComment: Comment) => void;
}

export function CommentSection({ videoId, comments, onCommentAdded }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return commentDate.toLocaleDateString();
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const comment = await addComment({ videoId, comment: newComment.trim() });
      setNewComment('');
      onCommentAdded?.(comment);
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentContainer}>
      <Avatar size={32} style={styles.avatar}>
        <AvatarImage uri={item.userId.metadata.profile.avatar} />
      </Avatar>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <ThemedText style={styles.username}>{item.userId.username}</ThemedText>
          <ThemedText style={styles.timestamp}>
            {formatTimeAgo(item.createdAt)}
          </ThemedText>
        </View>
        <ThemedText style={styles.commentText}>{item.text}</ThemedText>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item._id}
        style={styles.commentList}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.inputContainer}>
        <Input
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Add a comment..."
          style={styles.input}
          multiline
        />
        <TouchableOpacity
          onPress={handleSubmitComment}
          disabled={!newComment.trim() || isSubmitting}
          style={[
            styles.submitButton,
            (!newComment.trim() || isSubmitting) && styles.submitButtonDisabled
          ]}
        >
          <ThemedText style={styles.submitButtonText}>
            {isSubmitting ? 'Sending...' : 'Send'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  commentList: {
    flex: 1,
  },
  commentContainer: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  avatar: {
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.6,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    marginRight: 12,
    maxHeight: 100,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
}); 