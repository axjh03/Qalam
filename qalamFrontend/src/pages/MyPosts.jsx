import React, { useState, useEffect } from 'react';
import ActualPostCard from '../features/PostCard/ActualPostCard';
import PageHeader from '../components/PageHeader';
import { getBackendUrl } from '../utils/api.js';

export default function MyPosts({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/posts/my-posts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      } else {
        console.error('Failed to fetch my posts');
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching my posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
      });

      if (response.ok) {
        setPosts(posts.filter(p => p.postId !== postId));
        alert('Post deleted successfully');
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('An error occurred while deleting the post.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader pageType="myPosts" />
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-xl">You haven't created any posts yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <ActualPostCard 
              key={post.postId} 
              post={post} 
              onDelete={handleDeletePost}
            />
          ))}
        </div>
      )}
    </div>
  );
} 