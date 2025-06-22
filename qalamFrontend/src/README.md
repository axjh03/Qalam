# Frontend Directory Structure

This document outlines the organized structure of the Qalam frontend application.

## Directory Organization

### `/src/features/`
Contains feature-specific components that represent business logic and user interactions.

- **PostCard/** - Post display components (ActualPostCard, BigPostCard, CompactPostCard)
- **CommentCard/** - Comment display and interaction components
- **ProfileCard/** - User profile display components
- **SuggestFriendCard/** - Friend suggestion components
- **ProfileView/** - Profile viewing components

### `/src/modals/`
Contains modal components for overlays and popups.

- **CreatePostModal.jsx** - Modal for creating new posts
- **CommentModal/** - Modal for displaying and managing comments
- **PostModal/** - Modal for displaying posts in detail

### `/src/ui/`
Contains reusable UI components that are not tied to specific features.

- **ImageCropper.jsx** - Image cropping utility component
- **LoadMore/** - Load more functionality components

### `/src/layout/`
Contains layout components that structure the application.

- **Navbar.jsx** - Main navigation component

### `/src/pages/`
Contains page-level components that represent entire routes.

- **Home.jsx** - Home page component
- **MyPosts.jsx** - User's posts page
- **People.jsx** - People discovery page
- **UserProfile.jsx** - User profile page
- **signin/** - Authentication pages

### `/src/styles/`
Contains all styling files.

- **tailwind.css** - Tailwind CSS configuration
- **index.scss** - Global styles
- **App.scss** - App-specific styles

### `/src/utils/`
Utility functions and helpers (to be added as needed).

### `/src/hooks/`
Custom React hooks (to be added as needed).

### `/src/assets/`
Static assets like images, icons, etc.

### `/src/common/`
Shared constants, types, and configurations (to be organized as needed).

## Import Conventions

- Use relative imports for components within the same feature
- Use absolute imports from index files for cross-feature imports
- Keep imports organized and grouped by type (React, third-party, internal)

## Best Practices

1. **Feature-based organization**: Group related components together
2. **Separation of concerns**: Keep UI, business logic, and layout separate
3. **Reusability**: Place reusable components in `/ui/`
4. **Consistency**: Follow established naming conventions
5. **Documentation**: Keep this README updated as the structure evolves 