import React from "react"

export default function CompactPostCard() {
  return (
    <div className="w-full hover:shadow-md transition-shadow duration-200 cursor-pointer bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-xs font-bold text-white">AJ</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base text-gray-900 mb-1">Building Scalable React Applications</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="font-medium">Alok Jha</span>
                <span>•</span>
                <span>3 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 