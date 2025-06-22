  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-4 sm:p-6">
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Profile Picture */}
        {user.profilePictureUrl ? (
          <img
            src={user.profilePictureUrl}
            alt={user.username}
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-sm sm:text-lg font-bold text-white">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* User Info */}
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
            {user.username}
          </h3>
          <p className="text-sm text-gray-500">
            {user.posts?.length || 0} posts
          </p>
        </div>

        {/* Follow Button */}
        <button
          onClick={() => handleFollow(user.id)}
          disabled={isFollowing}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition-colors ${
            isFollowing
              ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>
    </div>
  ); 