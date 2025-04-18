'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from '@fortawesome/free-solid-svg-icons';

type DriveImage = {
  name: string;
  id: string;
  url: string;
};

export default function FadingGallery() {
  const [images, setImages] = useState<DriveImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCurrentImage, setShowCurrentImage] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);

  // Generate random rotation and scale
  const generateRandomTransform = () => {
    const newRotation = Math.random() * 8 - 4; // Random number between -4 and 4
    const newScale = 0.95 + Math.random() * 0.15; // Random number between 0.95 and 1.1
    setRotation(newRotation);
    setScale(newScale);
  };

  useEffect(() => {
    fetch('/api/drive-images')
      .then((res) => res.json())
      .then(setImages)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (images.length === 0) return;
    
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setShowCurrentImage(false);
      
      // Generate new random transform values
      generateRandomTransform();
      
      // Wait for fade out to complete
      setTimeout(() => {
        setCurrentIndex((prev) => {
          const next = (prev + 1) % images.length;
          // Pre-load the next image
          setLoadedImages(prev => new Set([...prev, next]));
          return next;
        });
        
        // Start the fade in
        setTimeout(() => {
          setShowCurrentImage(true);
          setTimeout(() => {
            setIsTransitioning(false);
          }, 300);
        }, 50);
      }, 500);
    }, 3000); // Change image every 5 minutes

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="flex gap-8 h-full">
      <aside 
        className="w-full h-full component--dim rounded-2xl p-8 transition-all duration-500 ease-in-out" 
        style={{ 
          transform: `rotate(${rotation}deg) scale(${scale})`,
          width: '100%',
          transition: 'transform 500ms ease-in-out, width 500ms ease-in-out, opacity 300ms ease-in-out',
          opacity: isTransitioning ? 0.3 : 1
        }}
      >
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <div className="relative w-full h-[100%]">
              <h2 className="text-3xl font-bold text-white tracking-wide mb-4 eyebrow--dim gallery-heading">
                <FontAwesomeIcon icon={faCamera} width="32" /> Shamrock Snapshots
              </h2>
              {images.map((img, index) => {
                const isCurrent = index === currentIndex;
                
                if (!isCurrent) return null;

                return (
                  <div
                    key={img.id}
                    className="absolute top-0 left-0 w-full h-full mt-6 transition-opacity duration-500 ease-in-out"
                    style={{
                      opacity: showCurrentImage ? 1 : 0,
                    }}
                  >
                    {loadedImages.has(index) && (
                      <Image
                        src={img.url}
                        alt={img.name}
                        fill
                        loading="eager"
                        style={{ objectFit: 'cover', border: '1px solid black' }}
                        priority={true}
                        className="gallery-image"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
