import React, { useState } from "react";
import ImageCropper from "../../ui/ImageCropper";

export default function Sign({ onLoginSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    symbol: false
  });

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTempImage(e.target.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = (croppedImageUrl) => {
    setSelectedImage(croppedImageUrl);
    setShowCropper(false);
  };

  const validatePassword = (pass) => {
    const validations = {
      length: pass.length >= 8,
      lowercase: /[a-z]/.test(pass),
      uppercase: /[A-Z]/.test(pass),
      symbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pass)
    };
    
    setPasswordValidation(validations);
    return Object.values(validations).every(Boolean);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
    validatePasswords(newPassword, confirmPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    validatePasswords(password, newConfirmPassword);
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setFullName(newName);
  };

  const handleUsernameChange = (e) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
  };

  const validatePasswords = (pass, confirmPass) => {
    if (confirmPass && pass !== confirmPass) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  };

  const isSignUpDisabled = () => {
    const isPasswordValid = Object.values(passwordValidation).every(Boolean);
    return isSignUp && (passwordError || !password || !confirmPassword || !isPasswordValid);
  };

  const handleLogin = async () => {
    console.log('Login button clicked!');
    console.log('Username:', username);
    console.log('Password:', password);
    
    try {
      const response = await fetch('https://github.com/settings/developershttp://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: username,
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🎉 Login successful!');
        console.log('🔑 JWT Token:', data.access_token);
        console.log('👤 User signed in as:', username);
        
        // Store the JWT token for future use
        localStorage.setItem('jwt_token', data.access_token);
        console.log('💾 JWT token stored in localStorage');
        
        // Call the onLoginSuccess callback with user data
        if (onLoginSuccess) {
          onLoginSuccess({
            username: username,
            access_token: data.access_token,
            profilePictureKey: data.user?.profilePictureKey || localStorage.getItem('user_profile_picture_key')
          });
        }
        
        // You can also decode the JWT to see the payload (optional)
        try {
          const payload = JSON.parse(atob(data.access_token.split('.')[1]));
          console.log('📋 JWT Payload:', payload);
          console.log('🆔 User ID:', payload.sub);
        } catch (error) {
          console.log('Could not decode JWT payload:', error);
        }
      } else {
        console.log('❌ Login failed:', response.status);
        const errorText = await response.text();
        console.log('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const handleSignup = async () => {
    console.log('Signup button clicked!');
    console.log('Username:', username);
    console.log('Full Name:', fullName);
    console.log('Password:', password);
    
    try {
      // First, upload image to S3 if selected
      let s3ImageUrl = '';
      let uploadData = null;
      if (selectedImage) {
        console.log('Uploading image to S3...');
        
        // Convert base64 image to blob
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', blob, `profile-${username}.jpg`);
        formData.append('username', username);
        
        // Upload directly through backend
        const uploadResponse = await fetch('http://localhost:3000/upload/signup', {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          uploadData = await uploadResponse.json();
          s3ImageUrl = uploadData.publicUrl;
          console.log('✅ Image uploaded to S3 successfully!');
          console.log('🖼️ S3 Image URL:', s3ImageUrl);
          console.log('📁 S3 File Key:', uploadData.fileKey);
          
          // Store profile picture key for later use during login
          localStorage.setItem('user_profile_picture_key', uploadData.fileKey);
        } else {
          console.log('❌ S3 upload failed:', uploadResponse.status);
          const errorText = await uploadResponse.text();
          console.log('Upload error:', errorText);
        }
      }

      // Then create user account
      const response = await fetch('http://localhost:3000/auth/signup', {
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
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Signup successful!');
        console.log('📸 Profile picture uploaded to S3:', data.profilePictureUrl);
        
        // Store profile picture URL for later use during login
        localStorage.setItem('user_profile_picture', data.profilePictureUrl);
        
        // Clear form
        setUsername('');
        setFullName('');
        setPassword('');
        setConfirmPassword('');
        setSelectedImage(null);
        setShowCropper(false);
        setTempImage(null);
        
        // Switch to sign in mode after successful signup
        setIsSignUp(false);
      } else {
        console.log('Signup failed:', response.status);
        const errorText = await response.text();
        console.log('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error during signup:', error);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  const handleGitHubLogin = () => {
    window.location.href = 'http://localhost:3000/auth/github';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative bg-gradient-to-br from-slate-50 to-white">
      {/* Header Section */}
      <div className="text-center mb-12 px-4">
        <h1 className="text-8xl md:text-9xl lg:text-[12rem] font-black bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 bg-clip-text text-transparent animate-gradient-x mb-4 leading-none" style={{
          fontFamily: "'Dancing Script', cursive, serif",
          backgroundSize: '200% 200%',
          animation: 'gradientFlow 3s ease-in-out infinite'
        }}>
          Qalam
        </h1>
        <p className="text-xl md:text-2xl font-light text-slate-600 max-w-2xl mx-auto">
          Place where your writing matters
        </p>
      </div>

      {/* Main Content - Wide Screen Layout */}
      <div className="w-full max-w-6xl px-4">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
          
          {/* Left Side - Social Buttons */}
          <div className="flex flex-col space-y-4 w-full max-w-sm lg:max-w-xs">
            <button
              class="rounded-md flex items-center justify-center border border-slate-300 py-3 px-6 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
              type="button"
              onClick={handleGoogleLogin}
            >
              <img
                src="https://docs.material-tailwind.com/icons/google.svg"
                alt="google"
                class="h-5 w-5 mr-3"
              />
              Continue with Google
            </button>
            
            <button
              class="rounded-md flex items-center justify-center border border-slate-300 py-3 px-6 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
              type="button"
              onClick={handleGitHubLogin}
            >
              <svg className="h-5 w-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.237 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="hidden lg:flex flex-col items-center">
            <div className="w-px h-32 bg-slate-300"></div>
            <span className="text-4xl font-bold text-slate-400 my-4">|</span>
            <div className="w-px h-32 bg-slate-300"></div>
          </div>

          {/* Right Side - Form */}
          <div className="flex flex-col space-y-4 w-full max-w-sm lg:max-w-xs">
            {/* Profile Picture - Top of Form (only in sign up mode) */}
            {isSignUp && (
              <div className="text-center mb-4">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-4 border-slate-300 shadow-lg">
                    {selectedImage ? (
                      <img 
                        src={selectedImage} 
                        alt="Profile preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="absolute -bottom-2 -right-2 bg-slate-800 text-white rounded-full p-2 cursor-pointer hover:bg-slate-700 transition-colors shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </label>
                </div>
                <p className="text-xs text-slate-600 mt-1">Click + to upload</p>
              </div>
            )}

            {/* Name field - only show in sign up mode */}
            {isSignUp && (
              <div className="w-full">
                <label className="block text-sm font-medium text-slate-700 mb-1 text-left">
                  Full Name
                </label>
                <input
                  class="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-blue-500 hover:border-blue-300 shadow-sm focus:shadow"
                  placeholder="Enter your full name"
                  type="text"
                  value={fullName}
                  onChange={handleNameChange}
                />
              </div>
            )}

            <div className="w-full">
              <label className="block text-sm font-medium text-slate-700 mb-1 text-left">
                Username
              </label>
              <input
                class="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-blue-500 hover:border-blue-300 shadow-sm focus:shadow"
                placeholder="Enter your username"
                type="text"
                value={username}
                onChange={handleUsernameChange}
              />
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-slate-700 mb-1 text-left">
                Password
              </label>
              <div className="relative">
                <input
                  class="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 pr-10 transition duration-300 ease focus:outline-none focus:border-teal-500 hover:border-teal-300 shadow-sm focus:shadow"
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Password Validation Display */}
              {isSignUp && password && (
                <div className="mt-2 p-3 bg-slate-50 rounded-md">
                  <p className="text-xs font-medium text-slate-700 mb-2">Password Requirements:</p>
                  <div className="space-y-1">
                    <div className={`flex items-center text-xs ${passwordValidation.length ? 'text-green-600' : 'text-red-500'}`}>
                      <svg className={`w-3 h-3 mr-2 ${passwordValidation.length ? 'text-green-600' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20">
                        {passwordValidation.length ? (
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        )}
                      </svg>
                      At least 8 characters
                    </div>
                    <div className={`flex items-center text-xs ${passwordValidation.lowercase ? 'text-green-600' : 'text-red-500'}`}>
                      <svg className={`w-3 h-3 mr-2 ${passwordValidation.lowercase ? 'text-green-600' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20">
                        {passwordValidation.lowercase ? (
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        )}
                      </svg>
                      One lowercase letter
                    </div>
                    <div className={`flex items-center text-xs ${passwordValidation.uppercase ? 'text-green-600' : 'text-red-500'}`}>
                      <svg className={`w-3 h-3 mr-2 ${passwordValidation.uppercase ? 'text-green-600' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20">
                        {passwordValidation.uppercase ? (
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        )}
                      </svg>
                      One uppercase letter
                    </div>
                    <div className={`flex items-center text-xs ${passwordValidation.symbol ? 'text-green-600' : 'text-red-500'}`}>
                      <svg className={`w-3 h-3 mr-2 ${passwordValidation.symbol ? 'text-green-600' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20">
                        {passwordValidation.symbol ? (
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        )}
                      </svg>
                      One special symbol (!@#$%^&*)
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password - only show in sign up mode */}
            {isSignUp && (
              <div className="w-full">
                <label className="block text-sm font-medium text-slate-700 mb-1 text-left">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    class={`w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border rounded-md px-3 py-2 pr-10 transition duration-300 ease focus:outline-none shadow-sm focus:shadow ${
                      passwordError ? 'border-red-500 focus:border-red-500 hover:border-red-400' : 'border-slate-200 focus:border-teal-500 hover:border-teal-300'
                    }`}
                    placeholder="Confirm your password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-red-500 text-xs mt-1">{passwordError}</p>
                )}
              </div>
            )}

            <div className="flex space-x-2 w-full">
              <button
                data-ripple-light="true"
                class={`flex-1 rounded-md py-2 px-4 border text-center text-sm transition-all shadow-md hover:shadow-lg disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ${
                  isSignUp 
                    ? 'bg-gradient-to-tr from-slate-800 to-slate-700 border-transparent text-white hover:bg-slate-700 focus:bg-slate-700 active:bg-slate-700' 
                    : 'border-slate-300 text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800'
                }`}
                type="button"
                onClick={isSignUp ? handleSignup : () => setIsSignUp(true)}
                disabled={isSignUp && isSignUpDisabled()}
              >
                Sign Up
              </button>
              <button
                class={`flex-1 rounded-md border py-2 px-4 text-center text-sm transition-all shadow-sm hover:shadow-lg disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ${
                  !isSignUp 
                    ? 'bg-gradient-to-tr from-slate-800 to-slate-700 border-transparent text-white hover:bg-slate-700 focus:bg-slate-700 active:bg-slate-700' 
                    : 'border-slate-300 text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800'
                }`}
                type="button"
                onClick={!isSignUp ? handleLogin : () => setIsSignUp(false)}
                disabled={!isSignUp && (!username || !password)}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && tempImage && (
        <ImageCropper
          image={tempImage}
          onClose={() => setShowCropper(false)}
          onSave={handleCropSave}
        />
      )}

      <p className="absolute bottom-4 text-sm text-slate-500">Made with ❤️ by <a href="https://github.com/axjh03" className="text-slate-500 hover:text-slate-700">Alok Jha</a></p>
    </div>
  );
}
