import { addComment, getComments } from '@/scripts/videos';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';
import { ThemedText } from '../ThemedText';
import { Avatar, AvatarImage } from './Avatar';
import { IconSymbol } from './IconSymbol';
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
  style?: ViewStyle;
  onClose?: () => void;
  onDragChange?: (dy: number) => void;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
}

export function CommentSection({ videoId, onCommentAdded, style, onClose, onDragChange, onInteractionStart, onInteractionEnd, comments: initialComments }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<any>(null);
  const backgroundColor = '#1a1a1a';
  const borderColor = 'rgba(255, 255, 255, 0.1)';

  // Keyboard animation
  const keyboardAnim = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  // Drag handle to hide comments
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_evt, gesture) => {
        const isVertical = Math.abs(gesture.dy) > Math.abs(gesture.dx);
        return isVertical && gesture.dy > 2;
      },
      onPanResponderGrant: () => {
        onInteractionStart?.();
      },
      onPanResponderMove: (_evt, gesture) => {
        // Only allow downward drag to translate the whole sheet
        const dy = Math.max(0, gesture.dy);
        dragY.setValue(dy);
        onDragChange?.(dy);
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderRelease: (_evt, gesture) => {
        if (gesture.dy > 80) {
          Keyboard.dismiss();
          onClose?.();
        }
        Animated.spring(dragY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 0
        }).start();
        onDragChange?.(0);
        onInteractionEnd?.();
      },
      onPanResponderTerminate: () => {
        Animated.spring(dragY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 0
        }).start();
        onDragChange?.(0);
        onInteractionEnd?.();
      }
    })
  ).current;

  const fetchComments = useCallback(async (refresh = false) => {
    try {
      const newComments = await getComments({ videoId });
      console.log('comments', newComments);
      
      if (refresh) {
        setComments(newComments);
      } else {
        setComments(prev => [...prev, ...newComments]);
      }
      
      setHasMoreComments(newComments.length > 0);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [videoId]);

  React.useEffect(() => {
    setComments(initialComments || []);
    fetchComments(true);
  }, [videoId, initialComments, fetchComments]);

  // Loading spinner rotation control
  React.useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (isLoadingMore) {
      spinAnim.setValue(0);
      loop = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      loop.start();
    }
    return () => {
      if (loop) loop.stop();
    };
  }, [isLoadingMore, spinAnim]);

  React.useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        Animated.timing(keyboardAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        Animated.timing(keyboardAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [keyboardAnim]);

  const formatTimeAgo = useCallback((date: Date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return commentDate.toLocaleDateString();
  }, []);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const comment = await addComment({ videoId, comment: newComment.trim() });
      
      if (!comment || typeof comment !== 'object') {
        throw new Error('Invalid comment response from server');
      }

      setNewComment('');
      
      const formattedComment: Comment = {
        _id: comment._id || String(Date.now()),
        userId: comment.userId || {
          _id: '',
          username: 'Anonymous',
          metadata: {
            profile: {
              avatar: ''
            }
          }
        },
        text: comment.text || newComment.trim(),
        createdAt: comment.createdAt || new Date()
      };

      onCommentAdded?.(formattedComment);
      
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 300);
      
      Keyboard.dismiss();
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderComment = useCallback(({ item }: { item: Comment }) => {
    if (!item || !item.userId) {
      return null;
    }

    return (
      <Animated.View style={styles.commentContainer}>
        <Avatar size={32} style={styles.avatar}>
          <AvatarImage uri={item.userId?.metadata?.profile?.avatar || ''} />
        </Avatar>
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <ThemedText style={styles.username}>{item.userId?.username || 'Unknown User'}</ThemedText>
            <ThemedText style={styles.timestamp}>
              {item.createdAt ? formatTimeAgo(item.createdAt) : ''}
            </ThemedText>
          </View>
          <ThemedText style={styles.commentText}>{item.text || ''}</ThemedText>
        </View>
      </Animated.View>
    );
  }, [formatTimeAgo]);

  return (
    <View style={styles.rootTranslateWrapper}>
      <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, style]}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <View style={styles.draggableHeaderWrapper}>
        <View
          style={[styles.dragHandleContainer, { borderBottomColor: borderColor }]}
          {...panResponder.panHandlers}
        >
          <View style={styles.dragHandle} />
          <View style={styles.headerRow}>
            <ThemedText style={styles.headerTitle}>Comments</ThemedText>
            <ThemedText style={styles.commentCount}>{comments?.length || 0}</ThemedText>
          </View>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={comments || []}
        renderItem={renderComment}
        keyExtractor={(item) => item?._id || Math.random().toString()}
        style={[styles.commentList, { backgroundColor }]}
        contentContainerStyle={[
          styles.commentListContent,
          comments.length === 0 && { flex: 1 }
        ]}
        showsVerticalScrollIndicator={true}
        indicatorStyle="white"
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="interactive"
        scrollEnabled={true}
        alwaysBounceVertical={true}
        nestedScrollEnabled
        scrollEventThrottle={16}
        overScrollMode="always"
        onScrollBeginDrag={onInteractionStart}
        onScrollEndDrag={onInteractionEnd}
        onMomentumScrollEnd={onInteractionEnd}
        onEndReached={() => {
          if (!isLoadingMore && hasMoreComments) {
            setIsLoadingMore(true);
            fetchComments();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => {
          if (!isLoadingMore) return null;
          const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
          return (
            <View style={styles.loadingContainer}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <IconSymbol name="arrow.triangle.2.circlepath" size={20} color="#9583fe" />
              </Animated.View>
            </View>
          );
        }}
      />

      <Animated.View 
        style={[
          styles.inputContainer,
          {
            borderTopColor: borderColor,
            backgroundColor: backgroundColor,
            transform: [{
              translateY: keyboardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -keyboardHeight]
              })
            }]
          }
        ]}
      >
        <Input
          ref={inputRef}
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Add a comment..."
          style={styles.input}
          multiline
          maxLength={1000}
          textAlignVertical="center"
          blurOnSubmit={false}
        />
        <TouchableOpacity
          onPress={handleSubmitComment}
          disabled={!newComment.trim() || isSubmitting}
          style={[
            styles.submitButton,
            (!newComment.trim() || isSubmitting) && styles.submitButtonDisabled
          ]}
        >
          <IconSymbol
            name="arrow.up.circle.fill"
            size={32}
            color={!newComment.trim() || isSubmitting ? '#999' : '#007AFF'}
          />
        </TouchableOpacity>
      </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 200,
  },
  rootTranslateWrapper: {
    flex: 1,
  },
  draggableHeaderWrapper: {
    zIndex: 2,
  },
  dragHandleContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: 8,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat-Bold',
  },
  commentCount: {
    fontSize: 14,
    opacity: 0.6,
  },
  commentList: {
    flex: 1,
    width: '100%',
    paddingLeft: 12,
  },
  commentListContent: {
    paddingHorizontal: 12,
    paddingBottom: 16,
    flexGrow: 1,
  },
  loadingContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  commentContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
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
    fontWeight: '600',
    marginRight: 8,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.6,
  },
  commentText: {
    fontSize: 16,
    lineHeight: 20,
    color: 'lightgray',
    fontFamily: 'Inter-Regular',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    marginRight: 12,
    maxHeight: 100,
    paddingTop: 8,
    paddingBottom: 8,
  },
  submitButton: {
    width: 32,
    height: 32,
    color: '#2fa4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
}); 