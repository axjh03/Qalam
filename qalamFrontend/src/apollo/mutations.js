import { gql } from '@apollo/client';

// User Mutations
export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      userId
      username
      fullName
      email
      avatarUrl
      postCount
      likesCount
      commentsCount
      friendsCount
      dateJoined
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input)
  }
`;

export const UPDATE_AVATAR = gql`
  mutation UpdateAvatar($avatarUrl: String!) {
    updateAvatar(avatarUrl: $avatarUrl) {
      userId
      username
      fullName
      email
      avatarUrl
      postCount
      likesCount
      commentsCount
      friendsCount
      dateJoined
    }
  }
`;

export const ADD_FRIEND = gql`
  mutation AddFriend($friendId: String!) {
    addFriend(friendId: $friendId)
  }
`;

export const REMOVE_FRIEND = gql`
  mutation RemoveFriend($friendId: String!) {
    removeFriend(friendId: $friendId)
  }
`;

export const DELETE_ACCOUNT = gql`
  mutation DeleteAccount {
    deleteAccount
  }
`;

// Post Mutations
export const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      message
      post {
        postId
        title
        content
        imageUrl
        authorId
        authorUsername
        authorFullName
        authorAvatarUrl
        likesCount
        commentsCount
        createdAt
        updatedAt
        isLiked
      }
    }
  }
`;

export const CREATE_COMMENT = gql`
  mutation CreateComment($postId: String!, $input: CreateCommentInput!) {
    createComment(postId: $postId, input: $input) {
      message
      comment {
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
      commentsCount
    }
  }
`;

export const LIKE_POST = gql`
  mutation LikePost($postId: String!) {
    likePost(postId: $postId) {
      message
      liked
      likesCount
    }
  }
`;

export const UNLIKE_POST = gql`
  mutation UnlikePost($postId: String!) {
    unlikePost(postId: $postId) {
      message
      liked
      likesCount
    }
  }
`;

export const DELETE_POST = gql`
  mutation DeletePost($postId: String!) {
    deletePost(postId: $postId)
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($postId: String!, $commentId: String!) {
    deleteComment(postId: $postId, commentId: $commentId) {
      message
      commentsCount
    }
  }
`; 