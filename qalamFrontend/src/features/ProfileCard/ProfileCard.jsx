"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import FriendSuggestCard from "../SuggestFriendCard/FriendSuggestCard"
import LoadMore from "../../ui/LoadMore/LoadMore"
import { getBackendUrl } from '../../utils/api.js'

export default function ProfileCard({ user, refreshUserData }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [randomPeople, setRandomPeople] = useState([])
  const [displayedPeople, setDisplayedPeople] = useState([])
  const [userPosts, setUserPosts] = useState([])
  const [loadingPeople, setLoadingPeople] = useState(false)
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [currentPeoplePage, setCurrentPeoplePage] = useState(1)
  const [friends, setFriends] = useState([])
  const [loadingFriends, setLoadingFriends] = useState(false)
  const peoplePerPage = 6
  const loadMoreCount = 3

  // HD background images from Unsplash
  const backgroundImages = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=600&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=600&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1200&h=600&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&h=600&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&h=600&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&h=600&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&h=600&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1200&h=600&fit=crop&crop=center",
  ]

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Fetch random people
  const fetchRandomPeople = async () => {
    try {
      setLoadingPeople(true);
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter out the current user and shuffle
        const otherUsers = data.users.filter(u => u.userId !== user?.userId);
        const shuffledUsers = shuffleArray(otherUsers);
        setRandomPeople(shuffledUsers);
        setDisplayedPeople(shuffledUsers.slice(0, peoplePerPage));
        setCurrentPeoplePage(1);
      }
    } catch (error) {
      console.error('Error fetching random people:', error);
    } finally {
      setLoadingPeople(false);
    }
  };

  // Fetch user posts
  const fetchUserPosts = async () => {
    if (!user?.userId) return;
    
    try {
      setLoadingPosts(true);
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/posts/${user.userId}/posts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setUserPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Fetch user friends
  const fetchUserFriends = async () => {
    if (!user?.username) return;
    
    try {
      setLoadingFriends(true);
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/users/profile/${user.username}/friends`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error('Error fetching user friends:', error);
      setFriends([]);
    } finally {
      setLoadingFriends(false);
    }
  };

  // Shuffle background image every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length)
    }, 30000)

    return () => clearInterval(interval)
  }, [backgroundImages.length])

  // Fetch data when user changes
  useEffect(() => {
    if (user) {
      fetchRandomPeople();
      fetchUserPosts();
      fetchUserFriends();
    }
  }, [user]);

  // Also refresh friends when user data is refreshed
  useEffect(() => {
    if (user) {
      fetchUserFriends();
    }
  }, [user?.friendsCount]);

  const handleLoadMorePeople = () => {
    const shuffledPeople = shuffleArray([...randomPeople]);
    const nextPeople = shuffledPeople.slice(0, (currentPeoplePage * peoplePerPage) + loadMoreCount);
    setDisplayedPeople(nextPeople);
    setCurrentPeoplePage(prev => prev + 1);
  };

  const handleClose = () => {
    // Check if there's a previous page in browser history
    if (window.history.length > 1) {
      navigate(-1); // Go back to previous page
    } else {
      navigate('/home'); // Default to home if no previous page
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 p-6">
      {/* Main Profile Card */}
      <div
        className="w-full h-80 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl relative bg-white rounded-lg shadow-md"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Cross button on top right */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 h-10 w-10 z-20 bg-black/20 hover:bg-black/40 text-white rounded-md flex items-center justify-center transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-0 h-full relative">
          {/* Background Image with smooth transition */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
            style={{
              backgroundImage: `url('${backgroundImages[currentImageIndex]}')`,
            }}
          />

          {/* Gradient Overlay - disappears on hover */}
          <div
            className={`absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-black/60 transition-opacity duration-500 ${
              isHovered ? "opacity-0" : "opacity-100"
            }`}
          />

          {/* User Avatar in center - larger size */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="h-32 w-32 border-4 border-white shadow-lg rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {getInitials(user?.fullName || user?.username)}
              </span>
            </div>
          </div>

          {/* Content Overlay - no movement on hover */}
          <div className="absolute inset-0 flex flex-col justify-between p-8">
            {/* Top Section - Name and Username */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                  {user?.fullName || 'Unknown User'}
                </h1>
              </div>
              <div className="text-right">
                <p className="text-xl text-white/90 drop-shadow-lg mb-2">@{user?.username || 'unknown'}</p>
                <p className="text-sm text-white/80 drop-shadow-lg">
                  Joined on {formatDate(user?.dateJoined)}
                </p>
              </div>
            </div>

            {/* Bottom Section - Stats */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full">
                <span className="text-black font-medium">Posts Written</span>
                <div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold">
                  {user?.postCount || 0}
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full">
                <span className="text-black font-medium">Comments Written</span>
                <div className="bg-green-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold">
                  {user?.commentsCount || 0}
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full">
                <span className="text-black font-medium">Posts Liked</span>
                <div className="bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold">
                  {user?.likesCount || 0}
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full">
                <span className="text-black font-medium">Following</span>
                <div className="bg-purple-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold">
                  {user?.friendsCount || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Some Posts by User Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Some Posts by {user?.fullName || user?.username}</h2>
        {loadingPosts ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : userPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-xl text-gray-600">No Posts by {user?.fullName || user?.username}</p>
            <p className="text-gray-500 mt-2">This user hasn't published any posts yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userPosts.slice(0, 3).map((post, index) => (
              <div 
                key={post.postId || index} 
                className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-xl transition-shadow"
              >
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{post.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{post.subtitle}</p>
                <div className="text-xs text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Following Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Following</h2>
        {loadingFriends ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <p className="text-xl text-gray-600">{user?.fullName || user?.username} doesn't follow anybody else</p>
            <p className="text-gray-500 mt-2">Be the first to connect with them!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {friends.map((friend, index) => (
              <div key={`${friend.userId}-${index}`}>
                <FriendSuggestCard 
                  user={friend}
                  refreshUserData={refreshUserData}
                  onClose={() => {
                    // Remove this friend from the displayed list
                    setFriends(prev => prev.filter((_, i) => i !== index));
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Random People You May Know */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">People You May Know</h2>
        </div>

        {loadingPeople ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : displayedPeople.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No other users found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedPeople.map((person, index) => (
                <div key={`${person.userId}-${index}`}>
                  <FriendSuggestCard 
                    user={person}
                    refreshUserData={refreshUserData}
                    onClose={() => {
                      // Remove this person from the displayed list
                      setDisplayedPeople(prev => prev.filter((_, i) => i !== index));
                    }}
                  />
                </div>
              ))}
            </div>
            {displayedPeople.length > 0 && (
              <div className="mt-6">
                <LoadMore onLoadMore={handleLoadMorePeople} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 