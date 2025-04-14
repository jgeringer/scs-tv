'use client';

import { Announcement } from '../utils/contentful';
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
  const listRef = useRef<HTMLOListElement>(null);

  // Carousel autoplay effect
  useEffect(() => {
    if (!isCarousel || !emblaApi) return;

    emblaApi.reInit();

    if (autoplayInterval.current) {
      clearInterval(autoplayInterval.current);
    }

    autoplayInterval.current = setInterval(() => {
      if (!emblaApi) return;
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 5000);

    return () => {
      if (autoplayInterval.current) {
        clearInterval(autoplayInterval.current);
      }
    };
  }, [isCarousel, emblaApi, announcements]);

  // List auto-scroll effect
  useEffect(() => {
    if (isCarousel) return;

    const container = listRef.current;
    if (!container) return;

    const interval = setInterval(() => {
      const liElements = container.querySelectorAll('li');
      if (liElements.length === 0) return;

      const firstLi = liElements[0];
      const scrollStep = firstLi.getBoundingClientRect().height + 24;

      const maxScroll = container.scrollHeight - container.clientHeight;

      if (container.scrollTop + scrollStep >= maxScroll) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ top: scrollStep, behavior: 'smooth' });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isCarousel, announcements]);

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
                {/* {announcement.image && (
                  <div className="mt-4">
                    <Image
                      src={announcement.image.url}
                      alt={announcement.headline}
                      width={400}
                      height={300}
                      className="rounded-lg"
                    />
                  </div>
                )} */}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Not a carousel: render scrolling list
  return (
    <ol ref={listRef} className="space-y-6 h-[30vh] overflow-y-scroll scroll-smooth announcement-list">
      {announcements.map((announcement) => (
        <li key={announcement.id} className="border-b pb-8 pt-8">
          <div className="uppercase font-bold text-sm tracking-wide text-gray-600">{announcement.eyebrowText}</div>
          <h3 className={`${headlineSize === 'small' ? 'text-3xl' : 'text-4xl'} font-bold text-emerald-800 tracking-wide`}>
            {announcement.headline}
          </h3>
          {announcement.description && (
            <ContentfulRichText richTextDocument={announcement.description.json} />
          )}
          {/* {announcement.image && (
            <div className="mt-4">
              <Image
                src={announcement.image.url}
                alt={announcement.headline}
                width={400}
                height={300}
                className="rounded-lg"
              />
            </div>
          )} */}
        </li>
      ))}
    </ol>
  );
}
