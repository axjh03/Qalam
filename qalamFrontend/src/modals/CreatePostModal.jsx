import React, { useState, useRef } from 'react';

export default function CreatePostModal({ isOpen, onClose, onPublish, user }) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageName, setImageName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImageName(file.name);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImageName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const applyFormatting = (format) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let formattedText = '';
    if (format === 'bold') {
      formattedText = `**${selectedText}**`;
    } else if (format === 'italic') {
      formattedText = `*${selectedText}*`;
    }

    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);

    // Set cursor position after formatting
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 2, start + 2 + selectedText.length);
    }, 0);
  };

  const addNewline = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newContent = content.substring(0, start) + '\n' + content.substring(start);
    setContent(newContent);

    // Set cursor position after newline
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 1, start + 1);
    }, 0);
  };

  const uploadImageToS3 = async (file) => {
    try {
      // First, get the upload URL from backend
      const response = await fetch('http://localhost:3000/upload/direct', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
        },
        body: (() => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('username', user.username);
          return formData;
        })(),
      });

      if (response.ok) {
        const data = await response.json();
        return data.publicUrl;
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Please fill in title and content');
      return;
    }

    setIsUploading(true);

    try {
      let mediaUrl = null;
      let mediaType = 'none';

      // Upload image if selected
      if (selectedImage) {
        mediaUrl = await uploadImageToS3(selectedImage);
        mediaType = 'image';
      }

      const postData = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        contentStructure: content,
        mediaUrl,
        mediaType,
        createdAt: new Date().toISOString(),
        isPublished: true
      };

      onPublish(postData);
      handleDiscard();
    } catch (error) {
      console.error('Error publishing post:', error);
      alert('Failed to publish post. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDiscard = () => {
    setTitle('');
    setSubtitle('');
    setContent('');
    setSelectedImage(null);
    setImageName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!onClose) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[10001]">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Create Post</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Title Input */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Title (3x size)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-3xl font-bold border-none outline-none placeholder-gray-400 resize-none"
              maxLength={100}
            />
          </div>

          {/* Subtitle Input */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Subtitle (2x size)"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full text-2xl font-medium border-none outline-none placeholder-gray-400 resize-none"
              maxLength={200}
            />
          </div>

          {/* Formatting Toolbar */}
          <div className="mb-4 flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <button
              onClick={() => applyFormatting('bold')}
              className="px-3 py-1 rounded bg-white text-gray-700 border hover:bg-gray-100"
              title="Bold (Ctrl+B)"
            >
              <strong>B</strong>
            </button>
            <button
              onClick={() => applyFormatting('italic')}
              className="px-3 py-1 rounded bg-white text-gray-700 border hover:bg-gray-100"
              title="Italic (Ctrl+I)"
            >
              <em>I</em>
            </button>
            <button
              onClick={addNewline}
              className="px-3 py-1 rounded bg-white text-gray-700 border hover:bg-gray-100"
              title="New Line"
            >
              ↵ New Line
            </button>
            <div className="text-xs text-gray-500 ml-4">
              Select text and click B/I to format, or click New Line to add line breaks
            </div>
          </div>

          {/* Content Input */}
          <div className="mb-6">
            <textarea
              ref={textareaRef}
              placeholder="Write your content here... (1x size)&#10;Select text and use the formatting buttons above"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-lg border border-gray-200 rounded-lg p-4 outline-none focus:border-blue-500 resize-none min-h-[300px] font-mono"
            />
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            {!selectedImage ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">Click to upload an image</p>
                </div>
              </button>
            ) : (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">{imageName}</span>
                <button
                  onClick={removeImage}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={handleDiscard}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isUploading}
          >
            Discard
          </button>
          <button
            onClick={handlePublish}
            disabled={isUploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
} 