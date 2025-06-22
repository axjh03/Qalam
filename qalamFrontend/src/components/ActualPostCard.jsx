  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      {/* Post Image */}
      {post.imageUrl && (
        <div className="relative h-48 sm:h-64 overflow-hidden">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Post Content */}
      <div className="p-4 sm:p-6">
        {/* Title */}
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3 line-clamp-2">
          {post.title}
        </h2>

        {/* Subtitle */}
        {post.subtitle && (
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-2">
            {post.subtitle}
          </p>
        )}

        {/* Content Preview */}
        <div className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 line-clamp-3">
          {renderFormattedContent(post.content)}
        </div>

        {/* Author Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {post.author.profilePictureUrl ? (
              <img
                src={post.author.profilePictureUrl}
                alt={post.author.username}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-xs sm:text-sm font-bold text-white">
                  {post.author.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="text-sm sm:text-base font-medium text-gray-800">
                {post.author.username}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                {formatDate(post.createdAt)}
              </p>
            </div>
          </div>

          {/* Read More Button */}
          <button
            onClick={() => handleReadMore(post)}
            className="text-blue-600 hover:text-blue-800 text-sm sm:text-base font-medium transition-colors"
          >
            Read More →
          </button>
        </div>
      </div>
    </div>
  ); 