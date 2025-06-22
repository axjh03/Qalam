import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileCard = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-4 sm:p-6">
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Profile Picture */}
        {user.profilePictureUrl ? (
          <img
            src={user.profilePictureUrl}
            alt={user.username}
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-sm sm:text-lg font-bold text-white">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* User Info */}
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
            {user.username}
          </h3>
          <p className="text-sm text-gray-500">
            {user.posts?.length || 0} posts
          </p>
        </div>

        {/* View Profile Button */}
        <button
          onClick={() => navigate(`/users/${user.username}`)}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export default ProfileCard; 