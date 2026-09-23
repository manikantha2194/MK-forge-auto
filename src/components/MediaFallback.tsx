import React, { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';

interface MediaFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
  fallbackSrc?: string;
  className?: string;
}

export const MediaFallback: React.FC<MediaFallbackProps> = ({
  src,
  alt = 'Image',
  fallbackText,
  fallbackSrc,
  className = '',
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
  }, [src]);

  if (!currentSrc || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#0D0D0D] border border-[rgba(255,122,0,0.2)] text-[#777777] p-4 rounded-xl select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        <ImageOff className="w-8 h-8 text-[#FF7A00]/50 mb-2" />
        <span className="text-xs text-[#B8B8B8] font-medium text-center">
          {fallbackText || alt || 'Media Preview'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => {
        if (fallbackSrc && currentSrc !== fallbackSrc) {
          console.warn(`[MediaFallback] Failed to load "${currentSrc}", trying fallback "${fallbackSrc}"`);
          setCurrentSrc(fallbackSrc);
        } else {
          console.warn(`[MediaFallback] Failed to load image: ${currentSrc}`);
          setHasError(true);
        }
      }}
      className={className}
      {...props}
    />
  );
};
