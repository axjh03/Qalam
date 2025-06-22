import React, { useState, useEffect } from 'react';
import ActualPostCard from '../features/PostCard/ActualPostCard';
import PageHeader from '../components/PageHeader';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllPosts();
  }, []);

  const fetchAllPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/posts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      } else {
        console.error('Failed to fetch posts');
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader pageType="home" />
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-xl">No posts yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <ActualPostCard key={post.postId} post={post} />
          ))}
        </div>
      )}
    </div>
  );
} 