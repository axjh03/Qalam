import React from 'react';

export default function PostCard({ post }) {
  const renderContent = (contentStructure) => {
    if (!contentStructure) return null;
    
    // Split by newlines and render each paragraph
    const paragraphs = contentStructure.split('\n').filter(p => p.trim());
    
    return paragraphs.map((paragraph, index) => {
      let formattedText = paragraph;
      
      // Handle bold formatting (**text**)
      formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Handle italic formatting (*text*)
      formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      return (
        <p 
          key={index} 
          className="text-lg text-gray-700 mb-4 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formattedText }}
        />
      );
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Title */}
      {post.title && (
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          {post.title}
        </h1>
      )}
      
      {/* Subtitle */}
      {post.subtitle && (
        <h2 className="text-2xl font-medium text-gray-600 mb-6">
          {post.subtitle}
        </h2>
      )}
      
      {/* Content */}
      <div className="mb-6">
        {renderContent(post.contentStructure)}
      </div>
      
      {/* Media */}
      {post.mediaUrl && post.mediaType === 'image' && (
        <div className="mb-6">
          <img 
            src={post.mediaUrl} 
            alt="Post media" 
            className="w-full h-auto rounded-lg"
          />
        </div>
      )}
      
      {/* Post metadata */}
      <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-4">
          <span>Created: {new Date(post.createdAt).toLocaleDateString()}</span>
          {post.likesCount !== undefined && (
            <span>❤️ {post.likesCount}</span>
          )}
          {post.viewsCount !== undefined && (
            <span>👁️ {post.viewsCount}</span>
          )}
          {post.commentsCount !== undefined && (
            <span>💬 {post.commentsCount}</span>
          )}
        </div>
        {post.isPublished && (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
            Published
          </span>
        )}
      </div>
    </div>
  );
} 