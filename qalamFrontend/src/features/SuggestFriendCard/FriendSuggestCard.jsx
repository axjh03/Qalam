import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBackendUrl } from '../../utils/api.js';

export default function FriendSuggestCard({ user, onClose, refreshUserData }) {
  const navigate = useNavigate();
  const [isFriend, setIsFriend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  // Check friendship status on component mount
  useEffect(() => {
    checkFriendStatus();
  }, [user?.userId]);

  const checkFriendStatus = async () => {
    if (!user?.userId) return;
    
    try {
      setIsChecking(true);
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/users/friends/check/${user.userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsFriend(data.isFriend);
      }
    } catch (error) {
      console.error('Error checking friend status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleAddFriend = async () => {
    if (!user?.userId || isLoading) return;
    
    setIsLoading(true);
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/users/friends/add/${user.userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
      });
      
      if (response.ok) {
        setIsFriend(true);
        if (refreshUserData) {
          refreshUserData();
        }
      }
    } catch (error) {
      console.error('Error adding friend:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!user?.userId || isLoading) return;
    
    setIsLoading(true);
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/users/friends/remove/${user.userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
      });
      
      if (response.ok) {
        setIsFriend(false);
        if (refreshUserData) {
          refreshUserData();
        }
      }
    } catch (error) {
      console.error('Error removing friend:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleNameClick = () => {
    navigate(`/users/${user?.username}`);
  };

  return (
    <div className="w-full max-w-sm relative bg-white rounded-lg shadow-md border border-gray-200">
      {/* Cross button on top right */}
      <button 
        onClick={handleClose}
        className="absolute top-2 right-2 h-8 w-8 z-10 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors"
      >
        <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex items-center gap-4 p-4 pt-8">
        {/* Photo on left */}
        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
          <span className="text-lg font-bold text-white">
            {getInitials(user?.fullName || user?.username)}
          </span>
        </div>

        {/* Info on right */}
        <div className="flex flex-col flex-1">
          <h3 
            onClick={handleNameClick}
            className="font-semibold text-lg text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
          >
            {user?.fullName || 'Unknown User'}
          </h3>
          <p className="text-sm text-gray-600">@{user?.username || 'unknown'}</p>
          <p className="text-sm text-gray-500">{user?.postCount || 0} posts</p>
        </div>

        {/* Follow/Unfollow button */}
        <button 
          onClick={isFriend ? handleRemoveFriend : handleAddFriend}
          disabled={isLoading}
          className={`h-8 w-8 rounded-full border flex items-center justify-center transition-colors ${
            isFriend 
              ? 'border-red-300 bg-red-50 hover:bg-red-100 text-red-600' 
              : 'border-gray-300 hover:bg-gray-50 text-gray-600'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          ) : isFriend ? (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          )}
        </button>
      </div>
    </div>
  )
} 