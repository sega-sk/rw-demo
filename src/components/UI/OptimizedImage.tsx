// Optimized Image component with fallback support and loading states

import React, { useState, useEffect } from 'react';
import encryptedLoader, { IMAGE_SIZES } from '../../utils/imageOptimization';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  size?: keyof typeof IMAGE_SIZES;
  fallback?: string;
  lazy?: boolean;
  className?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'scale-down' | 'none';
  priority?: boolean;
  width?: number;
  height?: number;
}

export default function OptimizedImage({ 
  src, 
  alt, 
  size = 'medium',
  fallback = '/vdp hero (2).webp',
  lazy = true,
  className = '',
  objectFit,
  priority = false,
  width,
  height,
  ...props 
}: OptimizedImageProps) {
  const [optimizedSrc, setOptimizedSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const optimizeImage = async () => {
      try {
        if (src !== optimizedSrc) setIsLoading(true);
        const optimized = await encryptedLoader({ 
          src, 
          ...IMAGE_SIZES[size] 
        });
        setOptimizedSrc(optimized);
      } catch (error) {
        console.warn('Failed to optimize image:', error);
        setOptimizedSrc(src); // Fallback to original
      } finally {
        setIsLoading(false);
      }
    };

    if (src) {
      optimizeImage();
    }
  }, [src, size]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    if (fallback && optimizedSrc !== fallback) {
      setOptimizedSrc(fallback);
      setHasError(false);
    }
  };

  // Apply object-fit class if specified
  const objectFitClass = objectFit ? `object-${objectFit}` : '';

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" aria-hidden="true" />
      )}
      
      <img
        src={hasError ? fallback : optimizedSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : (lazy ? 'lazy' : 'eager')}
        decoding="async"
        width={width}
        height={height}
        className={`${objectFitClass} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        {...props}
      />
    </div>
  );
}