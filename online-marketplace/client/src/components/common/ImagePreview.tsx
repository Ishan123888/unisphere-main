"use client";

import React from "react";
import { Upload, X } from "lucide-react";

interface ImagePreviewProps {
  file: File | null;
  onClear: () => void;
}

/**
 * Image Preview Component
 * Displays selected image with option to clear
 */
export const ImagePreview: React.FC<ImagePreviewProps> = ({
  file,
  onClear,
}) => {
  const previewUrl = file ? URL.createObjectURL(file) : null;

  if (!file || !previewUrl) {
    return (
      <div className="flex items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <div className="flex flex-col items-center justify-center">
          <Upload className="w-10 h-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">No image selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <img
        src={previewUrl}
        alt="Preview"
        className="w-full h-48 object-cover rounded-lg"
      />
      <button
        onClick={onClear}
        type="button"
        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
        aria-label="Clear image"
      >
        <X className="w-5 h-5" />
      </button>
      {file && (
        <p className="mt-2 text-sm text-gray-600">
          File: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
        </p>
      )}
    </div>
  );
};
