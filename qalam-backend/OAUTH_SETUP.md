# OAuth Setup Guide

## GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Qalam Blog
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/auth/github/callback`
4. Click "Register application"
5. Copy the **Client ID** and **Client Secret**

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Choose "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback`
7. Copy the **Client ID** and **Client Secret**

## Environment Variables

Add these to your `.env` file:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## How It Works

1. User clicks "Continue with GitHub/Google"
2. User is redirected to GitHub/Google for authentication
3. After successful auth, user is redirected back to your app
4. The OAuth strategy extracts:
   - **Name**: Display name from the provider
   - **Photo**: Profile picture URL from the provider
   - **Username**: Email prefix (before @) from the provider's email
5. User is automatically logged in and redirected to the main app

## Features

- **Automatic User Creation**: New users are created automatically on first OAuth login
- **Profile Picture**: Automatically imports profile picture from OAuth provider
- **Username Generation**: Uses email prefix as username
- **Account Linking**: Existing users can link their OAuth accounts 