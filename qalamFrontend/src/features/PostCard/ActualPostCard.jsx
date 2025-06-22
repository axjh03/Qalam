"use client"

import React, { useState, useEffect, memo } from "react"
import { useNavigate } from "react-router-dom"
import CommentCard from '../CommentCard/CommentCard'
import LoadMore from "../../ui/LoadMore/LoadMore"
import { getBackendUrl } from '../../utils/api.js'

const ActualPostCard = memo(({ post, onDelete, refreshUserData }) => {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post?.likesCount || 0)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState([])
  const [displayedComments, setDisplayedComments] = useState([])
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(3)
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageUrl, setImageUrl] = useState(null)
  const [showActualDate, setShowActualDate] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // If the mediaUrl is an S3 key, fetch a signed URL
    if (post?.mediaUrl && post.mediaUrl.startsWith('posts/')) {
      const fetchSignedUrl = async () => {
        try {
          const backendUrl = getBackendUrl();
          const response = await fetch(`${backendUrl}/s3-url/${post.mediaUrl}`);
          if (response.ok) {
            const data = await response.json();
            setImageUrl(data.url);
          } else {
            console.error('Failed to get signed URL for post media');
            setImageUrl(null); // Or a placeholder
          }
        } catch (error) {
          console.error('Error fetching signed URL:', error);
        }
      };
      fetchSignedUrl();
    } else if (post?.mediaUrl) {
      // If it's a regular URL, just use it
      setImageUrl(post.mediaUrl);
    }
  }, [post?.mediaUrl]);

  useEffect(() => {
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
    checkLikeStatus();
  }, [post?.postId]);

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
        
        // Refresh user data to update likes count in profile
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

  const handleImageError = () => {
    // This could be more sophisticated, e.g., trying to refresh the URL
    console.warn('Image failed to load:', imageUrl);
    setImageUrl(null); // Fallback to not showing the image
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDateHover = (show) => {
    setShowActualDate(show);
  };

  const calculateReadTime = (post) => {
    if (!post) return '1 min read';
    const wordsPerMinute = 225;
    const text = `${post.title || ''} ${post.subtitle || ''} ${post.contentStructure || ''}`;
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n.charAt(0)).join("").toUpperCase().slice(0, 2);
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
        const fetchedComments = data.comments || []
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
        setDisplayedComments(prev => [newCommentData, ...prev.slice(0, visibleCommentsCount -1)])
        setNewComment('');
        
        // Refresh user data to update comment count
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
        
        // Refresh user data to update comment count
        if (refreshUserData) {
          refreshUserData();
        }
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleCommentClick = () => {
    if (!showComments) {
      fetchComments();
    }
    setShowComments(!showComments);
  };

  const handleLoadMoreComments = () => {
    const newVisibleCount = visibleCommentsCount + 3;
    setVisibleCommentsCount(newVisibleCount);
    setDisplayedComments(comments.slice(0, newVisibleCount));
  }

  if (!post) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 w-7/10 mx-auto">
      <div className="p-4 border-b border-gray-200">
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

      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h2>
        <p className="text-gray-600 mb-4">{post.subtitle}</p>
        <div className="text-gray-800 space-y-2">
          {renderContent(post.contentStructure)}
        </div>
      </div>

      {imageUrl && post.mediaType === 'image' && (
        <div className="w-full bg-gray-100 flex justify-center mt-4">
          <img 
            src={imageUrl} 
            alt={post.title}
            className="w-full h-auto object-contain max-h-[35vh]" 
            onError={handleImageError}
          />
        </div>
      )}

      <div className="p-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
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
          <button
            onClick={handleCommentClick}
            className="text-gray-500 hover:text-blue-500 hover:bg-gray-50 h-9 px-3 flex items-center gap-2 transition-colors rounded-md"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="text-sm font-medium">{post.commentsCount || 0}</span>
          </button>
        </div>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(post.postId);
            }}
            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full"
            title="Delete post"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
      
      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Comments ({comments.length})</h3>
          </div>
          
          {/* Comment Form */}
          <div className="p-4 border-b border-gray-200">
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
          <div className="p-4">
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
      )}
    </div>
  )
})

export default ActualPostCard 