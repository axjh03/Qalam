  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
        <div className="flex items-center space-x-4 sm:space-x-6">
          {/* Profile Picture */}
          {user?.profilePictureUrl ? (
            <img
              src={user.profilePictureUrl}
              alt={user.username}
              className="w-16 h-16 sm:w-24 sm:h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-xl sm:text-3xl font-bold text-white">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* User Info */}
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">
              {user?.username}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              {user?.posts?.length || 0} posts
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">
          Posts by {user?.username}
        </h2>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {user?.posts?.map((post) => (
            <ActualPostCard key={post.id} post={post} />
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* No Posts State */}
        {!loading && (!user?.posts || user.posts.length === 0) && (
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-sm sm:text-base text-gray-500">
              {user?.username} hasn't published any posts yet.
            </p>
          </div>
        )}
      </div>
    </div>
  ); 