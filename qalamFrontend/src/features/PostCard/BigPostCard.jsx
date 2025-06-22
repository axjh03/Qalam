import React from "react"

export default function BigPostCard({ title, content, timeAgo, likes, index }) {
  return (
    <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer">
      <div className="p-6 flex flex-col justify-center h-full">
        <h3 className="font-semibold text-lg mb-2">{title || `Post Title ${index + 1}`}</h3>
        <p className="text-gray-600 text-sm mb-4">
          {content || "This is a sample post content that would be displayed here..."}
        </p>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{timeAgo || "2 days ago"}</span>
          <span>{likes || "5"} likes</span>
        </div>
      </div>
    </div>
  )
} 