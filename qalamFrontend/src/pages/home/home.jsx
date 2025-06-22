  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Discover amazing stories and share your thoughts with the world.
        </p>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {posts.map((post) => (
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
      {!loading && posts.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No posts yet</h3>
          <p className="text-sm sm:text-base text-gray-500">Be the first to share a story!</p>
        </div>
      )}
    </div>
  ); 