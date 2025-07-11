import React, { useState, useRef } from 'react';
import { Upload, X, ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import Button from './Button';
import { apiService } from '../../services/api';
import { useMutation } from '../../hooks/useApi';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUploader({ images, onImagesChange, maxImages = 10 }: ImageUploaderProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGalleryExpanded, setIsGalleryExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: uploadFile, loading: uploading } = useMutation(
    async (file: File) => {
      try {
        return await apiService.uploadFile(file);
      } catch (error) {
        console.error('Upload failed:', error);
        if (error instanceof Error && error.message.includes('Authentication')) {
          // Redirect to login if authentication failed
          window.location.href = '/admin/login';
        }
        throw error;
      }
    }
  );

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        const result = await uploadFile(file);
        return result.url;
      } catch (error) {
        console.error('Upload failed:', error);
        return null;
      }
    });

    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(url => url !== null) as string[];
      onImagesChange([...images, ...validUrls].slice(0, maxImages));
    } catch (error) {
      console.error('Upload error:', error);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = async (index: number) => {
    const imageUrl = images[index];
    
    try {
      // Delete from server
      await apiService.deleteFile(imageUrl);
    } catch (error) {
      console.error('Failed to delete file from server:', error);
    }

    // Remove from local state regardless of server response
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    
    if (currentImageIndex >= newImages.length && newImages.length > 0) {
      setCurrentImageIndex(newImages.length - 1);
    } else if (newImages.length === 0) {
      setCurrentImageIndex(0);
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleExpandGallery = () => {
    setIsGalleryExpanded(true);
  };

  const closeExpandedGallery = () => {
    setIsGalleryExpanded(false);
  };

  // Expanded Gallery Modal
  const ExpandedGallery = () => (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* Close Button */}
        <button
          onClick={closeExpandedGallery}
          className="absolute top-4 right-4 bg-white bg-opacity-20 text-white p-2 rounded-full hover:bg-opacity-30 transition-all z-10"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Main Image */}
        <div className="relative max-w-4xl max-h-full">
          <img 
            src={images[currentImageIndex]} 
            alt={`Product ${currentImageIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-30 transition-all"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-30 transition-all"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Strip */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 bg-black bg-opacity-50 p-2 rounded-lg">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => selectImage(index)}
              className={`w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                index === currentImageIndex ? 'border-white' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img 
                src={image} 
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        {/* Image Counter */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
          {currentImageIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-4">
        {/* Upload Button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          <Button 
            type="button"
            variant="primary" 
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
            loading={uploading}
            disabled={images.length >= maxImages}
          >
            <Upload className="h-4 w-4 mr-2" />
            {images.length >= maxImages ? `Maximum ${maxImages} images` : 'Upload Images'}
          </Button>
        </div>

        {/* Main Image Display */}
        {images.length > 0 && (
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={images[currentImageIndex]} 
              alt={`Product ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all z-10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all z-10"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Remove Image Button */}
            <button
              type="button"
              onClick={() => removeImage(currentImageIndex)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Expand Button */}
            <button
              type="button"
              onClick={handleExpandGallery}
              className="absolute top-2 left-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all z-10"
            >
              <Expand className="h-4 w-4" />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        )}

        {/* Thumbnail Images */}
        {images.length > 1 && (
          <div className="grid grid-cols-3 gap-2">
            {images.slice(0, 6).map((image, index) => (
              <button
                key={index}
                type="button"
                onClick={() => selectImage(index)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentImageIndex ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img 
                  src={image} 
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
            {images.length > 6 && (
              <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                <span className="text-sm text-gray-500">+{images.length - 6}</span>
              </div>
            )}
          </div>
        )}

        {/* Expand Gallery Link */}
        {images.length > 0 && (
          <div className="text-center">
            <button 
              type="button"
              onClick={handleExpandGallery}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
            >
              Expand Gallery
            </button>
          </div>
        )}
      </div>

      {/* Expanded Gallery Modal */}
      {isGalleryExpanded && <ExpandedGallery />}
    </>
  );
}