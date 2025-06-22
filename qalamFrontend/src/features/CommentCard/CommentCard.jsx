import React from "react"
import { useNavigate } from "react-router-dom"

export default function CommentCard({ comment, onDelete }) {
  const navigate = useNavigate();

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

  const handleAuthorClick = (e) => {
    e.stopPropagation();
    if (comment?.authorUsername) {
      navigate(`/users/${comment.authorUsername}`);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete && comment?.commentId) {
      onDelete(comment.commentId);
    }
  };

  // Get current user ID from JWT token
  const getCurrentUserId = () => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub; // This is the userId from the JWT payload
      }
    } catch (error) {
      console.error('Error parsing JWT token:', error);
    }
    return null;
  };

  const currentUserId = getCurrentUserId();
  const isCommentAuthor = currentUserId === comment?.authorId;

  if (!comment) return null;

  return (
    <div className="w-full hover:shadow-sm transition-shadow duration-200 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4">
        <div className="flex gap-3">
          {/* User Photo */}
          <div 
            className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center cursor-pointer"
            onClick={handleAuthorClick}
          >
            <span className="text-sm font-bold text-white">
              {getInitials(comment.authorFullName)}
            </span>
          </div>

          {/* Comment Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h4 
                  className="font-semibold text-sm text-gray-900 cursor-pointer hover:underline"
                  onClick={handleAuthorClick}
                >
                  {comment.authorFullName}
                </h4>
                <span className="text-xs text-gray-500">@{comment.authorUsername}</span>
                <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
              </div>
              {isCommentAuthor && onDelete && (
                <button
                  onClick={handleDelete}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full"
                  title="Delete comment"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {comment.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 