import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CommentCard from '../features/CommentCard/CommentCard';
import LoadMore from '../ui/LoadMore/LoadMore';
import { getBackendUrl } from '../utils/api.js';

export default function PostModal({ post, isOpen, onClose, refreshUserData }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.likesCount || 0);
  const [comments, setComments] = useState([]);
  const [displayedComments, setDisplayedComments] = useState([]);
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(3);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [showActualDate, setShowActualDate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && post) {
      fetchComments();
      checkLikeStatus();
      fetchImageUrl();
    }
  }, [isOpen, post]);

  const fetchImageUrl = async () => {
    if (post?.mediaUrl && post.mediaUrl.startsWith('posts/')) {
      try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/s3-url/${post.mediaUrl}`);
        if (response.ok) {
          const data = await response.json();
          setImageUrl(data.url);
        } else {
          console.error('Failed to get signed URL for post media');
          setImageUrl(null);
        }
      } catch (error) {
        console.error('Error fetching signed URL:', error);
      }
    } else if (post?.mediaUrl) {
      setImageUrl(post.mediaUrl);
    }
  };

  const checkLikeStatus = async () => {
    if (!post?.postId) return;
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/posts/${post.postId}/like-status`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.isLiked);
      }
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const handleLikeToggle = async (e) => {
    e.stopPropagation();
    if (isLoading) return;
    setIsLoading(true);

    const method = isLiked ? 'DELETE' : 'POST';
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/posts/${post.postId}/like`, {
        method,
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` },
      });
      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikeCount(data.likesCount);
        
        if (refreshUserData) {
          refreshUserData();
        }
      }
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!post?.postId) return;
    
    setIsLoading(true);
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/posts/${post.postId}/comments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const fetchedComments = data.comments || [];
        setComments(fetchedComments);
        setDisplayedComments(fetchedComments.slice(0, 3));
        setVisibleCommentsCount(3);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !post?.postId) return;

    setIsSubmitting(true);
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/posts/${post.postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        const newCommentData = data.comment;
        setComments(prev => [newCommentData, ...prev]);
        setDisplayedComments(prev => [newCommentData, ...prev.slice(0, visibleCommentsCount - 1)]);
        setNewComment('');
        
        if (refreshUserData) {
          refreshUserData();
        }
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!post?.postId) return;

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/posts/${post.postId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
      });

      if (response.ok) {
        setComments(prev => prev.filter(c => c.commentId !== commentId));
        setDisplayedComments(prev => prev.filter(c => c.commentId !== commentId));
        
        if (refreshUserData) {
          refreshUserData();
        }
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleLoadMoreComments = () => {
    const newVisibleCount = visibleCommentsCount + 3;
    setVisibleCommentsCount(newVisibleCount);
    setDisplayedComments(comments.slice(0, newVisibleCount));
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n.charAt(0)).join("").toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Someday";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffSeconds = Math.floor(diffTime / 1000);

    if (diffSeconds < 60) return "just now";
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths}mo ago`;
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears}y ago`;
  };

  const formatActualDate = (dateString) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateReadTime = (post) => {
    if (!post?.contentStructure) return "1 min read";
    try {
      const content = JSON.parse(post.contentStructure);
      const wordCount = content.blocks.reduce((count, block) => {
        if (block.type === "paragraph" && block.data?.text) {
          return count + block.data.text.split(' ').length;
        }
        return count;
      }, 0);
      const readTime = Math.ceil(wordCount / 200);
      return `${readTime} min read`;
    } catch {
      return "1 min read";
    }
  };

  const renderContent = (content) => {
    if (!content) return null;
    try {
      const parsed = JSON.parse(content);
      return parsed.blocks.map((block) => {
        if (block.type === "paragraph") {
          return <p key={block.id} dangerouslySetInnerHTML={{ __html: block.data.text }} />;
        }
        return null;
      });
    } catch {
      return <p>{content}</p>;
    }
  };

  const handleAuthorClick = (e) => {
    e.stopPropagation();
    if (post?.authorUsername) {
      navigate(`/users/${post.authorUsername}`);
      onClose();
    }
  };

  const handleDateHover = (show) => {
    setShowActualDate(show);
  };

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10002] p-3 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col mx-3 sm:mx-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Post</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Post Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center gap-3 cursor-pointer"
                onClick={handleAuthorClick}
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-md flex-shrink-0">
                  <span className="text-sm font-bold text-white">
                    {getInitials(post.authorFullName)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-800 hover:underline">{post.authorFullName}</p>
                  <p className="text-sm text-gray-500 hover:underline">@{post.authorUsername}</p>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <p className="text-sm text-gray-500">{calculateReadTime(post)}</p>
                </div>
              </div>
              <p 
                className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 transition-colors" 
                onMouseEnter={() => handleDateHover(true)}
                onMouseLeave={() => handleDateHover(false)}
              >
                {showActualDate ? formatActualDate(post.createdAt) : formatDate(post.createdAt)}
              </p>
            </div>
          </div>

          {/* Post Content */}
          <div className="p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">{post.title}</h2>
            {post.subtitle && (
              <p className="text-gray-600 mb-4 text-base sm:text-lg">{post.subtitle}</p>
            )}
            <div className="text-gray-800 space-y-2 text-base sm:text-lg">
              {renderContent(post.contentStructure)}
            </div>
          </div>

          {/* Post Image */}
          {imageUrl && post.mediaType === 'image' && (
            <div className="w-full bg-gray-100 flex justify-center">
              <img 
                src={imageUrl} 
                alt={post.title}
                className="w-full h-auto object-contain max-h-[50vh]" 
              />
            </div>
          )}

          {/* Post Actions */}
          <div className="p-4 sm:p-6 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLikeToggle}
                disabled={isLoading}
                className={`h-9 px-3 flex items-center gap-2 transition-colors rounded-md ${
                  isLiked
                    ? "text-red-500 hover:text-red-600 bg-red-50"
                    : "text-gray-500 hover:text-red-500 hover:bg-gray-50"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : isLiked ? (
                  <span className="text-sm">❤️</span>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                )}
                <span className="text-sm font-medium">{likeCount}</span>
              </button>
              <div className="text-gray-500 h-9 px-3 flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span className="text-sm font-medium">{post.commentsCount || 0}</span>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="border-t border-gray-200 bg-gray-50">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Comments ({comments.length})</h3>
            </div>
            
            {/* Comment Form */}
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <form onSubmit={handleCommentSubmit} className="flex gap-3">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                  Send
                </button>
              </form>
            </div>
            
            {/* Comments List */}
            <div className="p-4 sm:p-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : comments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
              ) : (
                <div className="space-y-4">
                  {displayedComments.map((comment) => (
                    <CommentCard 
                      key={comment.commentId} 
                      comment={comment}
                      onDelete={() => handleDeleteComment(comment.commentId)}
                    />
                  ))}
                </div>
              )}
              {comments.length > displayedComments.length && (
                <div className="mt-4">
                  <LoadMore onLoadMore={handleLoadMoreComments} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 