'use client';

import { useState, useEffect, useRef } from 'react';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { REFRESH_INTERVAL } from '../utils/time';
import { formatDateTime, renderSportsIcon } from './SportsTickerTeamSnap';

// Define the event type based on the Google Sheets data structure
interface CalendarEvent {
  id: string;
  title: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  description?: string;
  location?: string;
  formattedDate?: {
    day: string;
    monthShort: string;
    weekdayShort: string;
    time: string;
  };
  dateObject?: Date;
  timeDescription?: string;
  teamName?: string;
  league_name?: string;
  sportType?: string;
  opponent?: string;
  result?: string;
  pointsForTeam?: number;
  pointsForOpponent?: number;
  time?: string;
}

export default function CalendarSection() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    async function fetchTeamSnapEvents() {
      try {
        if (!window.location.hash) return;
        const params = new URLSearchParams(window.location.hash.slice(1));
        const token = params.get('access_token');
        if (!token) return;

        // 1. Get programs from TeamSnap One v2 API
        const programsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/teamsnap/get-programs/?token=${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        const programsData = await programsRes.json();
        const programs = programsData.programs || [];
        console.log('📱 Programs fetched:', programs.length);

        // 2. Fetch schedules for all programs
        const allScheduleItems: any[] = [];
        for (const program of programs) {
          try {
            const scheduleRes = await fetch(
              `${process.env.NEXT_PUBLIC_BASE_URL}/api/teamsnap/get-schedule/?token=${token}&program_season_id=${program.id}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
              }
            );
            if (scheduleRes.ok) {
              const scheduleData = await scheduleRes.json();
              if (scheduleData.scheduleItems) {
                // Add program info to each schedule item
                const itemsWithProgram = scheduleData.scheduleItems.map((item: any) => ({
                  ...item,
                  program_name: program.name,
                  sport_name: program.sportName
                }));
                allScheduleItems.push(...itemsWithProgram);
                console.log(`📅 Program ${program.name} (${program.sportName}): ${scheduleData.scheduleItems.length} schedule items`);
              }
            }
          } catch (err) {
            console.error(`Error fetching schedule for program ${program.name}:`, err);
          }
        }

        // 3. Transform schedule items to event format
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        const eventsList = allScheduleItems
          .map((item: any) => {
            // Parse date and time from API
            // Prefer startDateTime (ISO format) over startDate + startTime
            let startDate: Date | null = null;
            
            if (item.startDateTime) {
              // startDateTime is ISO 8601 format: "2026-08-26T18:00:00Z" or similar
              // Parse it as UTC and then convert to local time
              const isoDate = new Date(item.startDateTime);
              // Create a date in local timezone with the UTC values
              startDate = new Date(isoDate.getTime());
            } else if (item.startDate) {
              // Fallback: if only startDate is available, use it
              // Try to extract time from startTime if available
              let hour = 0, minute = 0;
              if (item.startTime) {
                // startTime might be "18:00" or similar
                const timeParts = item.startTime.split(':');
                if (timeParts.length >= 1) hour = parseInt(timeParts[0], 10);
                if (timeParts.length >= 2) minute = parseInt(timeParts[1], 10);
              }
              const [year, month, day] = item.startDate.split('-').map(Number);
              startDate = new Date(year, month - 1, day, hour, minute, 0, 0);
            }
            
            return {
              id: item.id,
              title: item.name || (item.type === 'practice' ? 'Practice' : 'Game'),
              start: {
                dateTime: item.startDateTime,
                date: item.startDate,
              },
              dateObject: startDate,
              location: item.venueName || '',
              time: formatDateTime(startDate),
              sport_name: item.sport_name,
              event_type: item.type || 'event',
              program_name: item.program_name,
            };
          })
          .filter((event: any) => event.dateObject && event.dateObject >= now)
          .sort((a: any, b: any) => a.dateObject.getTime() - b.dateObject.getTime());

        console.log('🎉 Final events count:', eventsList.length);
        setEvents(eventsList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
        setLoading(false);
      }
    }

    fetchTeamSnapEvents();
    const interval = setInterval(fetchTeamSnapEvents, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);


  return (
    <>
      {loading ? (
        <div>Loading events...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="component rounded-2xl p-8 h-[100%] bottom-gradient overflow-hidden">
          <h2 className="text-2xl font-bold text-white tracking-wide pb-3 eyebrow"><FontAwesomeIcon icon={faCalendar} width="32" /> Upcoming athletics events</h2>
          <CalendarList
            events={events}
            listRef={listRef as React.RefObject<HTMLOListElement>}
            itemRefs={itemRefs}
          />
        </div>
      )}
    </>
  );
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// CalendarList component
function CalendarList({
  events,
  listRef,
  itemRefs
}: {
  events: CalendarEvent[],
  listRef: React.RefObject<HTMLOListElement>,
  itemRefs: React.MutableRefObject<(HTMLLIElement | null)[]>
}) {
  const [isResetAnimating, setIsResetAnimating] = useState(false);
  
  // Filter for only upcoming events
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const upcomingEvents = events.filter(e => e.dateObject && e.dateObject >= now);

  // Continuous slow scroll with pause at bottom
  useEffect(() => {
    if (upcomingEvents.length === 0 || !listRef.current) return;

    const scrollSpeed = 1; // pixels per interval
    const scrollInterval = 50; // milliseconds between scroll increments
    const pauseDuration = 10000; // 10 seconds at bottom
    const resetAnimationDuration = 3000; // 3 seconds to scroll back to top
    
    let animationFrameId: NodeJS.Timeout;
    let isAtBottom = false;
    let resetStartTime = 0;
    let resetStartScrollTop = 0;
    
    const scroll = () => {
      const ol = listRef.current;
      if (!ol) return;
      
      // If we're animating back to top, do that instead
      if (isResetAnimating) {
        const now = Date.now();
        const elapsed = now - resetStartTime;
        const progress = Math.min(elapsed / resetAnimationDuration, 1);
        const distance = resetStartScrollTop - 0;
        
        ol.scrollTop = resetStartScrollTop - (distance * progress);
        
        if (progress >= 1) {
          ol.scrollTop = 0;
          setIsResetAnimating(false);
          isAtBottom = false;
          animationFrameId = setTimeout(scroll, scrollInterval);
        } else {
          animationFrameId = setTimeout(scroll, 16); // ~60fps
        }
        return;
      }
      
      // Scroll down by 1 pixel
      ol.scrollTop += scrollSpeed;
      
      // Check if we've reached the bottom
      if (ol.scrollTop >= ol.scrollHeight - ol.clientHeight && !isAtBottom) {
        isAtBottom = true;
        // Pause for 10 seconds before animating back to top
        animationFrameId = setTimeout(() => {
          resetStartTime = Date.now();
          resetStartScrollTop = ol.scrollTop;
          setIsResetAnimating(true);
        }, pauseDuration);
        return;
      }
      
      animationFrameId = setTimeout(scroll, scrollInterval);
    };
    
    animationFrameId = setTimeout(scroll, scrollInterval);
    
    return () => clearTimeout(animationFrameId);
  }, [upcomingEvents.length, isResetAnimating]);

  if (upcomingEvents.length === 0) {
    return <div className="text-gray-500">No upcoming events</div>;
  }

  return (
    <div className="relative">
      <ol ref={listRef} className="space-y-4 max-h-[calc(100vh-400px)] pr-2 pb-10 pt-5 overflow-y-auto hide-scrollbar">
        {upcomingEvents.map((event, index) => {
          const dateObj = event.dateObject;
          const day = dateObj ? dateObj.getDate() : '';
          const monthShort = dateObj ? months[dateObj.getMonth()] : '';
          const time = event.time || '';
          return (
            <li
              key={event.id}
              ref={(el) => { itemRefs.current[index] = el; }}
              className={`flex items-start gap-4 duration-500 opacity-100`}
            >
              <div className="flex-shrink-0 w-16 text-center bg-emerald-800 text-white rounded-lg p-1">
                <div className="text-2xl font-bold">{day}</div>
                <div className="text-sm">{monthShort}</div>
                <div className="text-xs">{time}</div>
              </div>
              <div className="flex-1 flex">
                <h3 className="text-gray-700 font-semibold text-lg flex">
                  {event.league_name && (
                    <span className="w-[30px]">
                      {renderSportsIcon(event.league_name)}
                    </span>
                  )}
                </h3>
                <div className=''>
                  {event.sport_name && (
                    <div className="text-gray-700 font-bold text-sm uppercase tracking-wide">
                      {event.sport_name}
                      {event.event_type && (
                        <span className="ml-2 text-xs font-normal capitalize">({event.event_type})</span>
                      )}
                    </div>
                  )}
                  {event.program_name && !event.sport_name && (
                    <div className="text-gray-700 font-bold text-sm uppercase tracking-wide">
                      {event.program_name}
                      {event.event_type && (
                        <span className="ml-2 text-xs font-normal capitalize">({event.event_type})</span>
                      )}
                    </div>
                  )}
                  {event.teamName && (
                    <span className="text-gray-700 font-semibold text-lg leading-tight">{event.teamName}</span>
                  )}
                  {event.opponent && (
                    <p className="text-gray-700 mt-1">vs. {event.opponent}</p>
                  )}
                  {event.location && (
                    <p className="text-gray-700 mt-1">{event.location}</p>
                  )}
                  {event.result && (
                    <p className="text-gray-700 mt-1">Final: {event.result}</p>
                  )}
                </div>
                
              </div>
            </li>
          );
        })}
      </ol>
      <div className="gradient-list absolute bottom-0 left-0 right-0 pointer-events-none"></div>
    </div>
  );
}