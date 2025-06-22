"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ImageCropper from '../ui/ImageCropper'
import { getBackendUrl } from '../utils/api.js'

export default function Navbar({ user, onLogout, onPlusClick }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [profilePictureUrl, setProfilePictureUrl] = useState(user?.profilePictureKey || null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [tempImage, setTempImage] = useState(null)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const [isUploading, setIsUploading] = useState(false)

  // Fetch fresh profile picture URL on component mount
  useEffect(() => {
    if (user?.profilePictureKey) {
      fetchProfilePicture();
    }
  }, [user?.profilePictureKey]);

  const fetchProfilePicture = async () => {
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/profile-picture-url`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.profilePictureUrl) {
          setProfilePictureUrl(data.profilePictureUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching profile picture:', error);
    }
  };

  const handleHomeClick = () => {
    navigate('/home')
  }

  const handleMyPostsClick = () => {
    navigate('/my-posts')
  }

  const handlePeopleClick = () => {
    navigate('/people')
  }

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Create a temporary URL for the cropper
    const tempUrl = URL.createObjectURL(file);
    setTempImage(tempUrl);
    setShowCropper(true);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropSave = async (croppedImageUrl) => {
    try {
      // Convert data URL to blob
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', blob, `profile-${user.username}.jpg`);
      formData.append('username', user.username);

      // Upload to backend
      const backendUrl = getBackendUrl();
      const uploadResponse = await fetch(`${backendUrl}/upload/direct`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
        body: formData,
      });

      if (uploadResponse.ok) {
        const data = await uploadResponse.json();
        
        // Update user profile with new avatar
        const updateResponse = await fetch(`${backendUrl}/users/profile/avatar`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
          },
          body: JSON.stringify({
            avatarUrl: data.fileKey,
          }),
        });

        if (updateResponse.ok) {
          // Refresh profile picture
          fetchProfilePicture();
          alert('Profile picture updated successfully!');
        } else {
          alert('Failed to update profile picture');
        }
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      alert('Error updating profile picture');
    } finally {
      setShowCropper(false);
      setTempImage(null);
    }
  };

  const handleCropClose = () => {
    setShowCropper(false);
    setTempImage(null);
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      // Upload the file
      const backendUrl = getBackendUrl();
      const uploadResponse = await fetch(`${backendUrl}/upload/direct`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
        body: (() => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('username', user.username);
          return formData;
        })(),
      });

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        
        // Update user profile with new avatar URL
        const updateResponse = await fetch(`${backendUrl}/users/profile/avatar`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
          },
          body: JSON.stringify({
            avatarUrl: uploadData.fileKey,
          }),
        });

        if (updateResponse.ok) {
          setProfilePictureUrl(uploadData.publicUrl);
          // Update localStorage
          localStorage.setItem('user_profile_picture_key', uploadData.fileKey);
        }
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/users/delete`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
          },
        });

        if (response.ok) {
          onLogout();
        }
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 w-full p-2 sm:p-4 z-[10000]">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 bg-white/30 backdrop-blur-lg border border-white/20 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/10">
      {/* Left side - Qalam */}
      <div className="flex-1">
        <span 
          className="text-xl sm:text-2xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 bg-clip-text text-transparent cursor-pointer" 
          onClick={handleHomeClick}
          style={{
            fontFamily: "'Dancing Script', cursive, serif",
            backgroundSize: '200% 200%',
            animation: 'gradientFlow 3s ease-in-out infinite'
          }}
        >
          Qalam
        </span>
      </div>

      {/* Middle - Icons */}
      <div className="flex items-center gap-4 sm:gap-8">


        <button 
          onClick={handlePeopleClick}
          className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-105"
        >
          <img 
            src="https://cdn-icons-png.flaticon.com/512/6911/6911758.png" 
            alt="Home" 
            className="h-6 w-6 sm:h-8 sm:w-8"
          />
        </button>



        {/* Book Icon */}
        <button
          onClick={handleMyPostsClick}
          className={`h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-105 ${
            location.pathname === '/my-posts' ? 'bg-blue-50' : ''
          }`}
        >
          <img 
            src="https://cdn-icons-png.flaticon.com/512/864/864685.png" 
            alt="My Posts" 
            className="h-6 w-6 sm:h-8 sm:w-8"
          />
        </button>
        <button
          onClick={handleHomeClick}
          className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-105">
          <img 
            src="https://cdn-icons-png.flaticon.com/512/1946/1946488.png" 
            alt="Friends" 
            className="h-5 w-5 sm:h-6 sm:w-6"
          />
        </button>
        <div className="relative">
          <button className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-105">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/1827/1827504.png" 
              alt="Bell" 
              className="h-5 w-5 sm:h-6 sm:w-6"
            />
          </button>
          {/* Notification count would go here */}
        </div>

        {/* Plus Icon */}
        <button
          onClick={onPlusClick}
          className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-105"
        >
          <svg className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Right side - Profile */}
      <div className="flex-1 flex items-center justify-end gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          {profilePictureUrl && (
            <img
              src={profilePictureUrl}
              alt="Profile" 
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover shadow-lg"
            />
          )}
          <div 
            className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg ${
              !profilePictureUrl ? 'flex' : 'hidden'
            }`}
          >
            <span className="text-xs sm:text-sm font-bold text-white">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-gray-800 hidden sm:block">{user?.username || 'User'}</span>
        </div>
        
        {/* Settings Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-105"
          >
            <img 
              src="https://www.iconpacks.net/icons/2/free-settings-icon-3110-thumb.png" 
              alt="Settings" 
              className="h-6 w-6 sm:h-7 sm:w-7"
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[9999]">
              <div className="px-3 sm:px-4 py-2 border-b border-gray-100">
                <p className="text-xs sm:text-sm font-medium text-gray-800">{user?.username}</p>
                <p className="text-xs text-gray-500">Signed in</p>
              </div>
              
              <div className="py-1">
                <button
                  onClick={() => {
                    if (user?.username) navigate(`/users/${user.username}`);
                    setIsDropdownOpen(false);
                  }}
                  className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100"
                >
                  My Profile
                </button>
                <label className="block px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                  Change Profile Picture
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleProfilePictureChange}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-gray-100"
                >
                  Delete Account
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={() => {
                    onLogout();
                    navigate('/signin');
                    setIsDropdownOpen(false);
                  }}
                  className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      </nav>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Delete Account</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2 sm:space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 sm:px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-3 sm:px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {showCropper && tempImage && (
        <ImageCropper
          image={tempImage}
          onClose={handleCropClose}
          onSave={handleCropSave}
        />
      )}
    </div>
  )
} 


