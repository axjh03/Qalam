"use client"; // This directive is crucial for Next.js to treat this component as a Client Component

import React, { useState, useRef, useCallback, useEffect } from "react";

// The props interface is removed for JSX, but understanding the expected props is still key
// image: string - The URL of the image to be cropped
// onClose: () => void - Function to call when the cropper modal should close
// onSave: (croppedImage: string) => void - Function to call when the cropped image (base64 data URL) is saved

const ImageCropper = ({ image, onClose, onSave }) => {
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 }); // Current position of the image within the crop area
  const [scale, setScale] = useState(1); // Zoom level of the image
  const [isDragging, setIsDragging] = useState(false); // Whether the image is currently being dragged
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 }); // Initial mouse position when dragging starts
  const [croppedPreview, setCroppedPreview] = useState(null); // Base64 data URL of the cropped image preview
  const [imageLoaded, setImageLoaded] = useState(false); // Tracks if the image is fully loaded
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 }); // Original dimensions of the loaded image

  const canvasRef = useRef(null); // Reference to the hidden canvas element for cropping
  const imageRef = useRef(null); // Reference to the displayed image element
  const containerRef = useRef(null); // Reference to the crop container div

  // Handler for mouse down event on the image container
  const handleMouseDown = useCallback(
    (e) => {
      // Prevent dragging if image hasn't loaded yet
      if (!imageLoaded) return;
      e.preventDefault(); // Prevent default browser drag behavior
      setIsDragging(true); // Set dragging state to true

      // Calculate the starting position relative to the crop area
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setDragStart({
          x: e.clientX - rect.left - cropPosition.x,
          y: e.clientY - rect.top - cropPosition.y,
        });
      }
    },
    [cropPosition, imageLoaded], // Dependencies for useCallback
  );

  // Handler for mouse move event while dragging
  const handleMouseMove = useCallback(
    (e) => {
      // Only move if dragging is active and image is loaded
      if (isDragging && imageLoaded) {
        e.preventDefault(); // Prevent default browser drag behavior

        // Calculate new crop position based on mouse movement
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          setCropPosition({
            x: e.clientX - rect.left - dragStart.x,
            y: e.clientY - rect.top - dragStart.y,
          });
        }
      }
    },
    [isDragging, dragStart, imageLoaded], // Dependencies for useCallback
  );

  // Handler for mouse up event (dragging stops)
  const handleMouseUp = useCallback(() => {
    setIsDragging(false); // Reset dragging state
  }, []);

  // Function to draw the image onto a hidden canvas and generate the cropped preview
  const generateCroppedImage = useCallback(() => {
    // Ensure all necessary elements and image are loaded
    if (!image || !canvasRef.current || !imageLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous"; // Important for loading images from different origins

    img.onload = () => {
      const size = 200; // The desired output size for the square cropped image (e.g., for profile picture)
      canvas.width = size;
      canvas.height = size;

      // Clear canvas with white background
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);

      // Save context state before applying clipping path
      ctx.save();

      // Create circular clipping path for the output image
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip(); // Apply the circular clip

      // Calculate image dimensions to fit within the 320px container (w-80 in Tailwind)
      const containerSize = 320; // Corresponds to Tailwind's w-80 (320px)
      const imgAspect = img.width / img.height;

      let baseWidth, baseHeight;
      if (imgAspect > 1) {
        // Image is wider than tall
        baseWidth = containerSize;
        baseHeight = containerSize / imgAspect;
      } else {
        // Image is taller than wide, or square
        baseHeight = containerSize;
        baseWidth = containerSize * imgAspect;
      }

      // Apply the current scale (zoom) to the base dimensions
      const scaledWidth = baseWidth * scale;
      const scaledHeight = baseHeight * scale;

      // Calculate draw position relative to the center of the 320px container
      // The `cropPosition.x` and `cropPosition.y` values adjust this position.
      const centerX = containerSize / 2;
      const centerY = containerSize / 2;

      const drawX = centerX - scaledWidth / 2 + cropPosition.x;
      const drawY = centerY - scaledHeight / 2 + cropPosition.y;

      // Scale the draw coordinates and dimensions to the final canvas size (200x200)
      const scaleToCanvas = size / containerSize;
    ctx.drawImage(
        img,
        drawX * scaleToCanvas,
        drawY * scaleToCanvas,
        scaledWidth * scaleToCanvas,
        scaledHeight * scaleToCanvas,
      );

      // Restore context state (removes the clipping path for future draws if any)
      ctx.restore();

      // Get the cropped image as a data URL (PNG format)
      const croppedDataUrl = canvas.toDataURL("image/png");
      setCroppedPreview(croppedDataUrl); // Update the preview state
    };

    img.src = image; // Set the image source to trigger onload
  }, [image, cropPosition, scale, imageLoaded]); // Dependencies for useCallback

  // Handler for the save button click
  const handleSave = useCallback(() => {
    if (croppedPreview) {
      onSave(croppedPreview); // Call the onSave prop with the cropped image data
      onClose(); // Close the modal
    }
  }, [croppedPreview, onSave, onClose]); // Dependencies for useCallback

  // Zoom controls
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.1, 3)); // Increase scale, max 3x
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5)); // Decrease scale, min 0.5x

  // Handler for when the image element finishes loading
  const handleImageLoad = () => {
    if (imageRef.current) {
      // Get natural dimensions of the image
      setImageDimensions({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight,
      });
      setImageLoaded(true); // Set image loaded state
      setCropPosition({ x: 0, y: 0 }); // Reset crop position
      setScale(1); // Reset scale
      setCroppedPreview(null); // Clear any previous preview
    }
  };

  // Effect to automatically generate the cropped preview when image properties change
  useEffect(() => {
    if (imageLoaded) {
      // Debounce the preview generation to avoid frequent re-renders during dragging/zooming
      const handler = setTimeout(() => {
        generateCroppedImage();
      }, 100); // Wait 100ms after last change

      return () => clearTimeout(handler); // Cleanup timeout on unmount or dependency change
    }
  }, [imageLoaded, cropPosition, scale, generateCroppedImage]); // Dependencies for useEffect

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Crop Profile Picture</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 text-2xl">
            ×
          </button>
        </div>
        
        {/* Crop Area */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6"> {/* Added flex-col md:flex-row for responsiveness */}
            {/* Crop Editor */}
            <div className="flex-1">
              <div
                ref={containerRef}
                className="relative w-80 h-80 mx-auto border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-100"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Background Image - The draggable and zoomable image */}
            <img 
              ref={imageRef}
                  src={image || "https://placehold.co/320x320/E2E8F0/A0AEC0?text=Loading..."} // Fallback placeholder
              crossOrigin="anonymous"
                  alt="Crop preview"
                  className={`absolute select-none ${imageLoaded ? "cursor-move" : "cursor-wait"}`}
                  style={{
                    // Logic to ensure image initially covers the container, then scales
                    width: imageDimensions.width > imageDimensions.height ? "100%" : "auto",
                    height: imageDimensions.height > imageDimensions.width ? "100%" : "auto",
                    left: "50%",
                    top: "50%",
                    // Apply translation (drag) and scale (zoom)
                    transform: `translate(calc(-50% + ${cropPosition.x}px), calc(-50% + ${cropPosition.y}px)) scale(${scale})`,
                    transformOrigin: "center", // Ensures scaling from the center
                    opacity: imageLoaded ? 1 : 0.5, // Visual feedback for image loading
                    minWidth: "100%", // Ensure image at least covers the container
                    minHeight: "100%",
                    objectFit: "cover", // Ensures the image covers the area without distortion
                  }}
                  onLoad={handleImageLoad}
                  onMouseDown={handleMouseDown}
                  draggable={false} // Disable native browser dragging
                />

                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <div className="text-gray-500">Loading image...</div>
                  </div>
                )}

                {/* Circular Crop Overlay - This creates the "hole" in the overlay */}
                {imageLoaded && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                    {/* Clear circle - this is the actual visible crop area */}
                    <div
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-white"
                      style={{
                        // This trick creates a transparent circle by using a large box-shadow
                        // that extends beyond the div, masking the overlay behind it.
                        boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
                      }}
                    ></div>
                  </div>
                )}
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center justify-center gap-4 mt-4">
                <button
                  onClick={handleZoomOut}
                  disabled={!imageLoaded}
                  className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
                    />
                  </svg>
                </button>
                <span className="text-sm text-gray-600">{Math.round(scale * 100)}%</span>
                <button
                  onClick={handleZoomIn}
                  disabled={!imageLoaded}
                  className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="flex flex-col items-center justify-center md:flex-initial"> {/* Adjusted for responsiveness */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
                <div className="w-32 h-32 border-2 border-gray-200 rounded-full overflow-hidden bg-gray-100">
                  {croppedPreview ? (
                    <img
                      src={croppedPreview || "https://placehold.co/128x128/E2E8F0/A0AEC0?text=Preview"} // Fallback placeholder
                      alt="Cropped preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Preview</div>
                  )}
                </div>
              </div>
            </div>
        </div>
        
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-200 gap-4 sm:gap-0"> {/* Adjusted for responsiveness */}
            <div className="text-sm text-gray-600 text-center sm:text-left">
              {imageLoaded ? "Drag the image to position it, use zoom controls to adjust size" : "Loading image..."}
            </div>
            <div className="flex gap-3">
          <button
            onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
                disabled={!croppedPreview || !imageLoaded}
            className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
                Save
          </button>
            </div>
          </div>
        </div>

        {/* Hidden Canvas - Used for the actual image manipulation and cropping */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default ImageCropper; 