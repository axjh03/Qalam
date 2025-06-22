import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Sign from './pages/signin/sign'
import Navbar from './layout/Navbar'
import CreatePostModal from './modals/CreatePostModal'
import Home from './pages/Home'
import MyPosts from './pages/MyPosts'
import People from './pages/People'
import UserProfile from './pages/UserProfile'

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isBackendDown, setIsBackendDown] = useState(false);
  const [backendCheckAttempts, setBackendCheckAttempts] = useState(0);
  const [serverAwakened, setServerAwakened] = useState(false);

  // Function to check backend health
  const checkBackendHealth = async () => {
    try {
      const response = await fetch('http://localhost:3000/health', {
        method: 'GET',
        signal: AbortSignal.timeout(3000), // 3 second timeout
      });
      
      if (response.ok) {
        setIsBackendDown(false);
        return true;
      }
    } catch (error) {
      console.log('Backend health check failed:', error);
    }
    
    setIsBackendDown(true);
    return false;
  };

  useEffect(() => {
    let progressInterval;
    let healthCheckInterval;
    let attempts = 0;
    const maxAttempts = 30; // 30 attempts * 5 seconds = 150 seconds total

    const startHealthCheck = () => {
      healthCheckInterval = setInterval(async () => {
        attempts++;
        setBackendCheckAttempts(attempts);
        
        const isHealthy = await checkBackendHealth();
        
        if (isHealthy) {
          clearInterval(healthCheckInterval);
          setServerAwakened(true);
          // Show "Server awakened" message briefly before continuing
          setTimeout(() => {
            setIsLoading(false);
          }, 2000); // Show the success message for 2 seconds
        } else if (attempts >= maxAttempts) {
          // Don't clear the interval, just log that we're continuing
          console.log('Max attempts reached, but continuing to wait for server...');
        }
      }, 5000); // Check every 5 seconds
    };

    // Start health check immediately
    checkBackendHealth().then((isHealthy) => {
      if (!isHealthy) {
        startHealthCheck();
      } else {
        // Server is already up, continue with normal loading
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    });

    // Start progress bar
    progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 40); // 40ms * 50 steps = 2000ms total

    // Fallback timer in case health check doesn't complete (much longer now)
    const fallbackTimer = setTimeout(() => {
      setIsLoading(false);
    }, 180000); // 3 minutes max

    return () => {
      clearTimeout(fallbackTimer);
      clearInterval(progressInterval);
      clearInterval(healthCheckInterval);
    };
  }, []);

  // Check if user is already logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    const profilePictureKey = localStorage.getItem('user_profile_picture_key');
    const username = localStorage.getItem('username');
    
    // Check for OAuth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    const oauthToken = urlParams.get('token');
    const oauthUser = urlParams.get('user');
    
    if (oauthToken && oauthUser) {
      // OAuth callback - handle the login
      try {
        const userData = JSON.parse(decodeURIComponent(oauthUser));
        
        // Store the JWT token
        localStorage.setItem('jwt_token', oauthToken);
        localStorage.setItem('username', userData.username);
        if (userData.profilePictureKey) {
          localStorage.setItem('user_profile_picture_key', userData.profilePictureKey);
        }
        
        // Set authentication state
        setIsAuthenticated(true);
        setUser({
          username: userData.username,
          access_token: oauthToken,
          profilePictureKey: userData.profilePictureKey
        });
        
        // Clean up URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        
        console.log('🎉 OAuth login successful!', userData);
      } catch (error) {
        console.error('Error parsing OAuth user data:', error);
      }
    } else if (token && username) {
      // Regular login - user already logged in
      setIsAuthenticated(true);
      setUser({
        username: username,
        access_token: token,
        profilePictureKey: profilePictureKey
      });
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    console.log('🎉 Login successful in App.jsx!');
    console.log('👤 User data:', userData);
    
    // Store username and profile picture key in localStorage for persistence
    localStorage.setItem('username', userData.username);
    if (userData.profilePictureKey) {
      localStorage.setItem('user_profile_picture_key', userData.profilePictureKey);
    }
    
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('username');
    localStorage.removeItem('user_profile_picture_key');
    setIsAuthenticated(false);
    setUser(null);
  };

  const handlePlusClick = () => {
    setIsCreatePostModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreatePostModalOpen(false);
  };

  const handlePublishPost = async (postData) => {
    console.log('🎉 Publishing post...', postData);
    
    try {
      const response = await fetch('http://localhost:3000/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Post published successfully:', result);
        
        // Close modal after successful post creation
        setIsCreatePostModalOpen(false);
        
        // You could add a toast notification here
        alert('Post published successfully!');
      } else {
        throw new Error('Failed to publish post');
      }
    } catch (error) {
      console.error('❌ Error publishing post:', error);
      alert('Failed to publish post. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 bg-clip-text text-transparent mb-8" style={{
            fontFamily: "'Dancing Script', cursive, serif",
            backgroundSize: '200% 200%',
            animation: 'gradientFlow 3s ease-in-out infinite'
          }}>
            Qalam
          </h1>
          
          <div className="w-64 md:w-80 bg-slate-200 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <p className="text-slate-600 text-sm">Loading your writing journey...</p>
        </div>

        {/* Backend Status Modal */}
        {isBackendDown && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center shadow-xl">
              <div className="mb-6">
                {serverAwakened ? (
                  <>
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-green-600 mb-2">
                      Server Awakened!
                    </h3>
                    <p className="text-gray-600 text-sm">
                      The backend is now ready. Continuing to load...
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Waiting for Backend
                    </h3>
                    <p className="text-gray-600 text-sm">
                      The server is starting up... This usually takes about 2-3 minutes.
                    </p>
                  </>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Attempts:</span>
                  <span className="font-medium">{backendCheckAttempts}/30</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status:</span>
                  <span className={`font-medium ${serverAwakened ? 'text-green-500' : 'text-orange-500'}`}>
                    {serverAwakened ? 'Connected!' : 'Connecting...'}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 text-xs text-gray-400">
                {serverAwakened 
                  ? 'The app will continue loading shortly...'
                  : 'The app will continue loading once the server is ready.'
                }
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Sign onLoginSuccess={handleLoginSuccess} />;
  }

  // Show main app with routing if authenticated
  return (
    <Router>
      <div className="bg-gray-50 min-h-screen">
        {isAuthenticated && user && (
          <Navbar user={user} onLogout={handleLogout} onPlusClick={handlePlusClick} />
        )}
        <main className="pt-24 max-w-6xl mx-auto px-4">
          <Routes>
            {isAuthenticated ? (
              <>
                <Route path="/home" element={<Home />} />
                <Route path="/my-posts" element={<MyPosts />} />
                <Route path="/people" element={<People />} />
                <Route path="/users/:username" element={<UserProfile />} />
                {/* Default route for authenticated users */}
                <Route path="*" element={<Navigate to="/home" />} />
              </>
            ) : (
              <>
                <Route path="/signin" element={<Sign onLoginSuccess={handleLoginSuccess} />} />
                {/* Default route for non-authenticated users */}
                <Route path="*" element={<Navigate to="/signin" />} />
              </>
            )}
          </Routes>
        </main>
        {isAuthenticated && isCreatePostModalOpen && (
          <CreatePostModal 
            user={user}
            isOpen={isCreatePostModalOpen}
            onClose={handleCloseModal} 
            onPublish={handlePublishPost}
          />
        )}
      </div>
    </Router>
  );
}

export default App