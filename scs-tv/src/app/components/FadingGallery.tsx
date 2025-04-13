'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface GalleryItem {
  media: {
    url: string;
    title: string;
  };
}

interface FadingGalleryProps {
  items: GalleryItem[];
}

export default function FadingGallery({ items }: FadingGalleryProps) {
  console.log('items::::', items)
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000); // change every 5 seconds

    return () => clearInterval(interval);
  }, [items.length]);

  return (
    <div className="relative w-full h-[100%]">
      {items.map((item, index) => (
        <div
          key={index}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={item.media.url}
            alt={item.media.title}
            fill
            className="object-cover rounded-xl"
          />
          <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white text-center py-2 text-sm rounded-b-xl">
            {item.media.title}
          </div>
        </div>
      ))}
    </div>
  );
}
