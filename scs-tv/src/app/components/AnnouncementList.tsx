'use client';

import { Announcement } from '../utils/contentful';
import Image from 'next/image';
import ContentfulRichText from './ContentfulRichText';
import useEmblaCarousel from 'embla-carousel-react';
import { useEffect, useRef } from 'react';

interface AnnouncementListProps {
  announcements: Announcement[];
  headlineSize?: string;
  type?: string;
}

export default function AnnouncementList({ announcements, headlineSize, type }: AnnouncementListProps) {
  const isCarousel = type === 'Carousel';

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const autoplayInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();

      // Clear any existing interval
      if (autoplayInterval.current) {
        clearInterval(autoplayInterval.current);
      }

      autoplayInterval.current = setInterval(() => {
        if (!emblaApi) return;
        if (emblaApi.canScrollNext()) {
          emblaApi.scrollNext();
        } else {
          emblaApi.scrollTo(0); // Go back to the first slide
        }
      }, 5000); // 5 seconds

      return () => {
        if (autoplayInterval.current) {
          clearInterval(autoplayInterval.current);
        }
      };
    }
  }, [emblaApi, announcements]);

  if (announcements.length === 0) {
    return <div className="text-gray-500">No announcements</div>;
  }

  if (isCarousel) {
    return (
      <div className="overflow-hidden h-[18vh]" ref={emblaRef}>
        <div className="flex gap-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="min-w-full shrink-0">
              <div className="p-8 pt-4">
                <div className="uppercase font-bold text-sm tracking-wide bg-gray-200">{announcement.eyebrowText}</div>
                <h3 className={`${headlineSize === 'small' ? 'text-3xl' : 'text-6xl'} font-bold tracking-wide headline headline--shadow`}>
                  {announcement.headline}
                </h3>
                {announcement.description && (
                  <ContentfulRichText richTextDocument={announcement.description.json} />
                )}
                {announcement.image && (
                  <div className="mt-4">
                    <Image
                      src={announcement.image.url}
                      alt={announcement.headline}
                      width={400}
                      height={300}
                      className="rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!isCarousel) {
    const listRef = useRef<HTMLOListElement>(null);
  
    useEffect(() => {
      const container = listRef.current;
      if (!container) return;
  
      const interval = setInterval(() => {
        const liElements = container.querySelectorAll('li');
        if (liElements.length === 0) return;
  
        const firstLi = liElements[0];
        const scrollStep = firstLi.getBoundingClientRect().height + 24; // 24px from space-y-6
  
        const maxScroll = container.scrollHeight - container.clientHeight;
  
        if (container.scrollTop + scrollStep >= maxScroll) {
          // Reset to top
          container.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          // Scroll down by one item
          container.scrollBy({ top: scrollStep, behavior: 'smooth' });
        }
      }, 5000);
  
      return () => clearInterval(interval);
    }, [announcements]);
  
    return (
      <ol ref={listRef} className="space-y-6 h-[40vh] overflow-y-scroll scroll-smooth">
        {announcements.map((announcement) => (
          <li key={announcement.id} className="border-b pb-8 pt-8">
            <div className="uppercase font-bold text-sm tracking-wide text-gray-600">{announcement.eyebrowText}</div>
            <h3 className={`${headlineSize === 'small' ? 'text-3xl' : 'text-4xl'} font-bold text-emerald-800 tracking-wide`}>
              {announcement.headline}
            </h3>
            {announcement.description && (
              <ContentfulRichText richTextDocument={announcement.description.json} />
            )}
            {announcement.image && (
              <div className="mt-4">
                <Image
                  src={announcement.image.url}
                  alt={announcement.headline}
                  width={400}
                  height={300}
                  className="rounded-lg"
                />
              </div>
            )}
          </li>
        ))}
      </ol>
    );
  }
  
}
