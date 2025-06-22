import React, { useState, useRef } from 'react'
import ImageCropper from '../../ui/ImageCropper'
import { API_ENDPOINTS } from '../../config/api.js'

export default function Sign({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [showCropper, setShowCropper] = useState(false)
  const [tempImage, setTempImage] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const tempUrl = URL.createObjectURL(file)
      setTempImage(tempUrl)
      setShowCropper(true)
    }
  }

  const handleCropComplete = (croppedImage) => {
    setSelectedImage(croppedImage)
    setShowCropper(false)
    setTempImage(null)
  }

  const handleCropCancel = () => {
    setShowCropper(false)
    setTempImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadImageToS3 = async (file) => {
    try {
      setIsUploading(true)
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('username', username)

      const response = await fetch(API_ENDPOINTS.UPLOAD_SIGNUP, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        return data.fileKey
      } else {
        throw new Error('Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const handleLogin = async () => {
    console.log('Login button clicked!')
    console.log('Username:', username)
    console.log('Password:', password)
    
    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: username,
          password: password,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('🎉 Login successful!')
        console.log('🔑 JWT Token:', data.access_token)
        console.log('👤 User signed in as:', username)
        
        // Store the JWT token for future use
        localStorage.setItem('jwt_token', data.access_token)
        console.log('💾 JWT token stored in localStorage')
        
        // Call the onLoginSuccess callback with user data
        if (onLoginSuccess) {
          onLoginSuccess({
            username: username,
            access_token: data.access_token,
            profilePictureKey: data.user?.profilePictureKey || localStorage.getItem('user_profile_picture_key')
          })
        }
        
        // You can also decode the JWT to see the payload (optional)
        try {
          const payload = JSON.parse(atob(data.access_token.split('.')[1]))
          console.log('📋 JWT Payload:', payload)
          console.log('🆔 User ID:', payload.sub)
        } catch (error) {
          console.log('Could not decode JWT payload:', error)
        }
      } else {
        console.log('❌ Login failed:', response.status)
        const errorText = await response.text()
        console.log('Error response:', errorText)
      }
    } catch (error) {
      console.error('Error during login:', error)
    }
  }

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match!')
      return
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters long!')
      return
    }

    try {
      let uploadData = null
      
      // Upload image if selected
      if (selectedImage) {
        try {
          const fileKey = await uploadImageToS3(selectedImage)
          uploadData = { fileKey }
        } catch (error) {
          console.error('Failed to upload image:', error)
          alert('Failed to upload image. Please try again.')
          return
        }
      }

      const response = await fetch(API_ENDPOINTS.SIGNUP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          fullName: fullName,
          email: `${username}@example.com`, // For now, using a simple email format
          password: password,
          avatarUrl: uploadData?.fileKey || '',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Signup successful!')
        console.log('📸 Profile picture uploaded to S3:', data.profilePictureUrl)
        
        // Store profile picture URL for later use during login
        localStorage.setItem('user_profile_picture', data.profilePictureUrl)
        
        // Clear form
        setUsername('')
        setFullName('')
        setPassword('')
        setConfirmPassword('')
        setSelectedImage(null)
        setShowCropper(false)
        setTempImage(null)
        
        // Switch to sign in mode after successful signup
        setIsSignUp(false)
      } else {
        console.log('Signup failed:', response.status)
        const errorText = await response.text()
        console.log('Error response:', errorText)
      }
    } catch (error) {
      console.error('Error during signup:', error)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = API_ENDPOINTS.GOOGLE_AUTH
  }

  const handleGitHubLogin = () => {
    window.location.href = API_ENDPOINTS.GITHUB_AUTH
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 bg-clip-text text-transparent"
              style={{
                fontFamily: "'Dancing Script', cursive, serif",
                backgroundSize: '200% 200%',
                animation: 'gradientFlow 3s ease-in-out infinite'
              }}>
            Qalam
          </h1>
          <p className="text-gray-600 mt-2">
            {isSignUp ? 'Join the conversation' : 'Welcome back'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={(e) => { e.preventDefault(); isSignUp ? handleSignUp() : handleLogin(); }} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your full name"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
          </div>

          {isSignUp && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Confirm your password"
                  required
                />
              </div>

              {/* Profile Picture Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Picture (Optional)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {selectedImage && (
                  <div className="mt-2">
                    <img
                      src={selectedImage}
                      alt="Selected"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        {/* OAuth Buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            onClick={handleGitHubLogin}
            className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span>Continue with GitHub</span>
          </button>
        </div>

        {/* Toggle Sign In/Sign Up */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-1 text-purple-600 hover:text-purple-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && (
        <ImageCropper
          image={tempImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  )
}
