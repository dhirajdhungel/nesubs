import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface ImageDropzoneProps {
  onDrop: (file: File) => void;
  uploading: boolean;
  className?: string;
  accept?: Record<string, string[]>;
  maxSize?: number;
}

export function ImageDropzone({ 
  onDrop, 
  uploading, 
  className = "w-full h-48",
  accept = {
    'image/png': [],
    'image/jpeg': [],
    'image/webp': [],
    'image/svg+xml': []
  },
  maxSize = 5242880 // 5MB default
}: ImageDropzoneProps) {
  
  const handleDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length > 0) {
      onDrop(acceptedFiles[0]);
    }
  }, [onDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept,
    maxSize,
    multiple: false,
    disabled: uploading
  });

  return (
    <div
      {...getRootProps()}
      className={`relative border-2 border-dashed rounded-xl transition-all duration-200 flex flex-col items-center justify-center gap-3 cursor-pointer ${className} ${
        isDragActive
          ? "border-[#0A64BC] bg-blue-50 text-[#0A64BC]"
          : "border-gray-300 text-gray-600 hover:border-[#0A64BC] hover:bg-gray-50"
      } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
    >
      <input {...getInputProps()} />
      
      {uploading ? (
        <div className="flex flex-col items-center justify-center gap-3 pointer-events-none">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-[#0A64BC] rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-700">Uploading...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 pointer-events-none">
          <Upload className={`w-12 h-12 transition-transform ${isDragActive ? 'scale-110 text-[#0A64BC]' : 'text-gray-400'}`} />
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-900">
              {isDragActive ? "Drop image here" : "Click or drag files here"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supports PNG, JPG, WEBP (Max {Math.round(maxSize / 1024 / 1024)}MB)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
