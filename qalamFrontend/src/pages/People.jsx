import React, { useState, useEffect } from 'react';
import FriendSuggestCard from '../features/SuggestFriendCard/FriendSuggestCard';
import LoadMore from '../ui/LoadMore/LoadMore';
import PageHeader from '../components/PageHeader';

const People = () => {
  const [users, setUsers] = useState([]);
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const loadMoreCount = 5;

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      // Shuffle users and show first page
      const shuffledUsers = shuffleArray([...users]);
      setDisplayedUsers(shuffledUsers.slice(0, usersPerPage));
      setCurrentPage(1);
    }
  }, [users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        console.error('Failed to fetch users');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = () => {
    // This function can be called to refresh user data if needed
    // For now, we'll just refetch the users list
    fetchUsers();
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleLoadMore = () => {
    const shuffledUsers = shuffleArray([...users]);
    const nextUsers = shuffledUsers.slice(0, (currentPage * usersPerPage) + loadMoreCount);
    setDisplayedUsers(nextUsers);
    setCurrentPage(prev => prev + 1);
  };

  const handleRefresh = () => {
    const shuffledUsers = shuffleArray([...users]);
    setDisplayedUsers(shuffledUsers.slice(0, usersPerPage));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader pageType="people" />
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : displayedUsers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-xl">No users found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedUsers.map((user, index) => (
              <div key={`${user.userId}-${index}`}>
                <FriendSuggestCard 
                  user={user}
                  refreshUserData={refreshUserData}
                  onClose={() => {
                    // Remove this user from the displayed list
                    setDisplayedUsers(prev => prev.filter((_, i) => i !== index));
                  }}
                />
              </div>
            ))}
          </div>
          {displayedUsers.length > 0 && (
            <div className="mt-8">
              <LoadMore onLoadMore={handleLoadMore} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default People; 