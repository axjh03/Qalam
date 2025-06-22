import { gql } from '@apollo/client';

// User Queries
export const GET_ALL_USERS = gql`
  query GetAllUsers {
    getAllUsers {
      userId
      username
      fullName
      avatarUrl
      postCount
      dateJoined
    }
  }
`;

export const GET_USER_PROFILE = gql`
  query GetUserProfile($username: String!) {
    getUserProfile(username: $username) {
      userId
      username
      fullName
      avatarUrl
      postCount
      likesCount
      commentCount
      followerCount
      dateJoined
      email
    }
  }
`;

export const GET_MY_PROFILE = gql`
  query GetMyProfile {
    getMyProfile {
      userId
      username
      fullName
      avatarUrl
      postCount
      likesCount
      commentCount
      followerCount
      dateJoined
      email
    }
  }
`;

export const GET_FRIENDS = gql`
  query GetFriends {
    getFriends {
      userId
      username
      fullName
      avatarUrl
      postCount
      dateJoined
    }
  }
`;

export const GET_USER_FRIENDS = gql`
  query GetUserFriends($username: String!) {
    getUserFriends(username: $username) {
      userId
      username
      fullName
      avatarUrl
      postCount
      dateJoined
    }
  }
`;

// Post Queries
export const GET_ALL_POSTS = gql`
  query GetAllPosts {
    getAllPosts {
      posts {
        postId
        title
        content
        imageUrl
        authorId
        authorUsername
        authorFullName
        authorAvatarUrl
        likesCount
        commentCount
        createdAt
        updatedAt
        isLiked
      }
    }
  }
`;

export const GET_MY_POSTS = gql`
  query GetMyPosts {
    getMyPosts {
      posts {
        postId
        title
        content
        imageUrl
        authorId
        authorUsername
        authorFullName
        authorAvatarUrl
        likesCount
        commentCount
        createdAt
        updatedAt
        isLiked
      }
    }
  }
`;

export const GET_POSTS_BY_AUTHOR = gql`
  query GetPostsByAuthor($authorId: String!) {
    getPostsByAuthor(authorId: $authorId) {
      posts {
        postId
        title
        content
        imageUrl
        authorId
        authorUsername
        authorFullName
        authorAvatarUrl
        likesCount
        commentCount
        createdAt
        updatedAt
        isLiked
      }
    }
  }
`;

export const GET_COMMENTS = gql`
  query GetComments($postId: String!) {
    getComments(postId: $postId) {
      comments {
        commentId
        postId
        content
        authorId
        authorUsername
        authorFullName
        authorAvatarUrl
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_LIKE_STATUS = gql`
  query GetLikeStatus($postId: String!) {
    getLikeStatus(postId: $postId)
  }
`; 