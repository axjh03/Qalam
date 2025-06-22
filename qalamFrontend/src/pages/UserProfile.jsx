import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProfileCard from '../features/ProfileCard/ProfileCard';
import { getBackendUrl } from '../utils/api.js';

export default function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (username) {
      console.log('Fetching profile for username:', username);
      fetchUserProfile();
    }
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const cleanUsername = username.replace('@', '');
      console.log('Clean username:', cleanUsername);
      
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/users/profile/${cleanUsername}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('User data received:', data);
        setUser(data.user);
      } else if (response.status === 404) {
        setError('User not found');
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setError('Failed to load user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = () => {
    fetchUserProfile();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">User Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/people')}
            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Back to People
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <p className="text-gray-600 text-xl">No user data available</p>
        </div>
      </div>
    );
  }

  return <ProfileCard user={user} refreshUserData={refreshUserData} />;
} 