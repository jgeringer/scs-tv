'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { REFRESH_INTERVAL } from '../utils/time';

type DriveImage = {
  name: string;
  id: string;
  url: string;
};

export default function FadingGallery() {
  const [images, setImages] = useState<DriveImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCurrentImage, setShowCurrentImage] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [imageSize, setImageSize] = useState({ width: 1000, height: 1000 });
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Generate random rotation, scale, and size
  const generateRandomTransform = () => {
    const newRotation = Math.random() * 8 - 4; // Random number between -4 and 4
    const newScale = 0.95 + Math.random() * 0.15; // Random number between 0.95 and 1.1
    
    // Generate random image size between 900-1200
    const newWidth = 900 + Math.random() * 300;
    const newHeight = 900 + Math.random() * 300;
    
    setRotation(newRotation);
    setScale(newScale);
    setImageSize({ width: newWidth, height: newHeight });
  };

  // Handle image load
  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  // Reset image loaded state when changing images
  useEffect(() => {
    setIsImageLoaded(false);
  }, [currentIndex]);

  // Fetch images on component mount
  useEffect(() => {
    fetch('/api/drive-images')
      .then((res) => res.json())
      .then((imgs) => {
        setImages(imgs);
        if (imgs.length > 0) {
          setCurrentIndex(Math.floor(Math.random() * imgs.length));
        }
      })
      .catch(console.error);
  }, []);

  // Set up image rotation interval
  useEffect(() => {
    if (images.length === 0 || currentIndex === null) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setShowCurrentImage(false);

      generateRandomTransform();

      setTimeout(() => {
        // Pick a random index different from the current one
        setCurrentIndex((prev) => {
          if (images.length <= 1 || prev === null) return prev ?? 0;
          let next;
          do {
            next = Math.floor(Math.random() * images.length);
          } while (next === prev);
          return next;
        });

        setTimeout(() => {
          setShowCurrentImage(true);
          setTimeout(() => {
            setIsTransitioning(false);
          }, 300);
        }, 50);
      }, 500);
    }, 20000); // Change image every 20 seconds

    return () => clearInterval(interval);
  }, [images.length, currentIndex]);

  if (images.length === 0 || currentIndex === null) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-white text-xl">Loading images...</div>
      </div>
    );
  }

  return (
    <div className="flex gap-8 justify-center items-center h-full">
      <aside 
        className="w-full component--dim rounded-2xl p-8 transition-all duration-1500 ease-in-out z-1" 
        style={{ 
          transform: `rotate(${rotation}deg) scale(${scale})`,
          width: 'auto',
          transition: 'transform 200ms ease-in-out, width 200ms ease-in-out, opacity 300ms ease-in-out',
          opacity: isTransitioning || !isImageLoaded ? 0 : 1
        }}
      >
        <div className="flex flex-col">
          <div className="flex-1">
            <div className="relative w-full">
              <h2 className="text-3xl font-bold text-white tracking-wide eyebrow--dim gallery-heading">
                <FontAwesomeIcon icon={faCamera} width="32" /> Shamrock Snapshots
              </h2>
              
              <div
                className="top-0 left-0 w-full transition-opacity duration-500 ease-in-out"
                style={{
                  opacity: showCurrentImage ? 1 : 0,
                }}
              >
                <Image
                  src={images[currentIndex].url}
                  alt={images[currentIndex].name}
                  width={imageSize.width}
                  height={imageSize.height}
                  loading="eager"
                  style={{ 
                    border: '1px solid black',
                    transition: 'width 500ms ease-in-out, height 500ms ease-in-out'
                  }}
                  priority={true}
                  className="gallery-image"
                  onLoad={handleImageLoad}
                />
              </div>
            </div>
            
          </div>
        </div>
      </aside>
      <Image
            src="/shamrock.png"
            width={500}
            height={500}
            alt="shamrock"
            style={{
              mixBlendMode: 'lighten',
              filter: 'blur(10px)',
              position: 'absolute',
              top: 'calc(-300px + 50vh)',
              left: 'calc(50vw)',
              opacity: .25,
            }}
          />
    </div>
  );
}
