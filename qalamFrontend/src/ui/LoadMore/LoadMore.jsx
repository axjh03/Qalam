import React, { useState } from 'react';

export default function LoadMore({ onLoadMore }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onLoadMore) {
        onLoadMore();
      }
    }, 2000);
  };

  return (
    <div className="flex justify-center items-center p-6">
      {isLoading ? (
        <button 
          disabled 
          className="px-4 py-2 bg-white text-slate-800 rounded-full flex items-center gap-2 opacity-50 cursor-not-allowed border border-slate-200 shadow-sm"
        >
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-800"></div>
          Loading...
        </button>
      ) : (
        <button 
          onClick={handleLoadMore}
          className="px-4 py-2 bg-white text-slate-800 rounded-full hover:bg-gray-50 transition-colors border border-slate-200 shadow-sm"
        >
          Load More
        </button>
      )}
    </div>
  );
}