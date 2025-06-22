  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">Crop Image</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4">
          <div className="mb-4 sm:mb-6">
            <ReactCrop
              crop={crop}
              onChange={setCrop}
              aspect={1}
              circularCrop
              className="max-h-64 sm:max-h-96"
            >
              <img
                src={image}
                alt="Crop preview"
                className="max-w-full h-auto"
              />
            </ReactCrop>
          </div>

          {/* Instructions */}
          <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
            Drag the corners to adjust the crop area. The image will be cropped to a circle.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 sm:space-x-3 p-3 sm:p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 sm:px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  ); 