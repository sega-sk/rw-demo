import React, { useState, useEffect } from 'react';
import encryptedLoader, { IMAGE_SIZES } from '../../utils/imageOptimization';

interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  sizes?: {
    mobile?: keyof typeof IMAGE_SIZES;
    tablet?: keyof typeof IMAGE_SIZES;
    desktop?: keyof typeof IMAGE_SIZES;
  };
  fallback?: string;
  className?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'scale-down' | 'none';
}

export default function ResponsiveImage({ 
  src, 
  alt, 
  sizes = { mobile: 'small', tablet: 'medium', desktop: 'large' },
  fallback = '/vdp hero (2).webp',
  className = '',
  objectFit,
  ...props 
}: ResponsiveImageProps) {
  const [srcSet, setSrcSet] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const generateSrcSet = async () => {
      try {
        setIsLoading(true);
        
        const promises = await Promise.all([
          encryptedLoader({ src, ...IMAGE_SIZES[sizes.mobile || 'small'] }),
          encryptedLoader({ src, ...IMAGE_SIZES[sizes.tablet || 'medium'] }),
          encryptedLoader({ src, ...IMAGE_SIZES[sizes.desktop || 'large'] })
        ]);

        const [mobileUrl, tabletUrl, desktopUrl] = promises;
        
        const srcSetString = [
          `${mobileUrl} ${IMAGE_SIZES[sizes.mobile || 'small'].width}w`,
          `${tabletUrl} ${IMAGE_SIZES[sizes.tablet || 'medium'].width}w`,
          `${desktopUrl} ${IMAGE_SIZES[sizes.desktop || 'large'].width}w`
        ].join(', ');

        setSrcSet(srcSetString);
      } catch (error) {
        console.warn('Failed to generate responsive images:', error);
        setSrcSet('');
      } finally {
        setIsLoading(false);
      }
    };

    if (src) {
      generateSrcSet();
    }
  }, [src, sizes]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Determine object-fit based on screen size if not explicitly set
  const getObjectFitClass = () => {
    if (objectFit) return `object-${objectFit}`;
    return 'object-contain md:object-cover'; // Default responsive behavior
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      
      <img
        src={hasError ? fallback : src}
        srcSet={hasError ? '' : srcSet}
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        decoding="async"
        className={`${getObjectFitClass()} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        {...props}
      />
    </div>
  );
}