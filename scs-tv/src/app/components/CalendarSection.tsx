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

        // 1. Get organization, so that we can get all of the divisions.
        const organizationRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/teamsnap/get-organization/?token=${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        // extract all of the division IDs
        const organizationJson = await organizationRes.json();
        const divisionIds = organizationJson.collection.items.map((item: any) => {
          return item.data.find((d: any) => d.name === "id")?.value;
        }).filter((id: any) => id !== undefined).join(',');

        console.log('💥💥💥 Division IDs::::', divisionIds); // 907610,911665,913956,913959,913970,973432,973585,1006476,1025375

        // 1. Get division (teams). First call
        // Updated this to make a separate get-division call for each division ID, then combine the results.
        // Update this to make a call for each division ID, then combine the results.
        const divisionIdArr = divisionIds.split(',');
        const divisionResults = [];
        for (const divisionId of divisionIdArr) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/teamsnap/get-division/?token=${token}&division_ids=${divisionId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
          });
          const json = await res.json();
          console.log('💥💥💥 Division JSON for division ID ' + divisionId + '::::', json);
          if (json.collection?.items) {
            divisionResults.push(...json.collection.items);
          }
        }
        const combinedDivisionJson = { collection: { items: divisionResults } };
        
        // const divisionRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/teamsnap/get-division/?token=${token}&division_ids=${divisionIds}`, {
        //   method: 'GET',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${token}`
        //   },
        // });
        // const divisionJson = await divisionRes.json();
        // console.log('💥💥💥 Division JSON::::', divisionJson);
        console.log('💥💥💥 combinedDivisionJson JSON::::', combinedDivisionJson);

        const teamIds = combinedDivisionJson.collection.items.map((item: any) => {
          return item.data.find((d: any) => d.name === "id")?.value;
        }).filter((id: any) => id !== undefined).join(',');


        console.log('💥💥💥 Team IDs::::', teamIds);

        // 2. Get events
        const eventsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/teamsnap/get-events/?token=${token}&team_id=${teamIds}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        const eventsJson = await eventsRes.json();
        const eventItems = eventsJson.collection.items;
        console.log('💥💥💥 Event Items::::', eventItems);

        // 3. Get division locations
        const divisionLocationIds = eventItems.map((item: any) => {
  return item.data.find((d: any) => d.name === "division_location_id")?.value;
}).filter((id: any) => id !== null).join(',');

        console.log('💥💥💥 Division Location IDs::::', divisionLocationIds);

        const divisionLocationsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/teamsnap/get-division-locations/?token=${token}&divisionLocations=${divisionLocationIds}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        const divisionLocationsJson = await divisionLocationsRes.json();
        console.log('💥💥💥 Division Locations JSON - ::::', divisionLocationsJson);
        const locationMap: Record<string, any> = {};
        divisionLocationsJson.collection.items?.forEach((item: any) => {
          const id = item.data.find((d: any) => d.name === "id")?.value;
          locationMap[id] = item.data.find((d: any) => d.name === "name")?.value;
        });
        console.log('💥💥💥 Location Map::::', locationMap);

        // Combine event data
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const eventsList = eventItems
          .map((item: any) => {
            const data = Object.fromEntries(item.data.map((d: any) => [d.name, d.value]));
            const dateObj = data.start_date ? new Date(data.start_date) : null;
            // Find the team object from combinedDivisionJson, which contains team data
            const teamObj = combinedDivisionJson.collection.items.find((t: any) => t.data.find((d: any) => d.name === "id")?.value === data.team_id);
            const teamName = teamObj?.data.find((d: any) => d.name === "name")?.value;
            const leagueName = teamObj?.data.find((d: any) => d.name === "league_name")?.value;
            return {
              id: data.id,
              title: data.name || data.formatted_title || data.formatted_title_for_multi_team || 'Game',
              dateObject: dateObj,
              location: data.division_location_id ? locationMap[data.division_location_id] : '',
              opponent: data.opponent_name,
              teamName,
              league_name: leagueName,
              result: data.formatted_results,
              pointsForTeam: data.points_for_team,
              pointsForOpponent: data.points_for_opponent,
              time: dateObj ? formatDateTime(dateObj) : '',
            };
          })
          .filter((event: any) => event && event.dateObject && event.dateObject >= now)
          .sort((a: any, b: any) => a.dateObject.getTime() - b.dateObject.getTime());

        setEvents(eventsList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
        setLoading(false);
      }
    }

    fetchTeamSnapEvents();
    const interval = setInterval(fetchTeamSnapEvents, REFRESH_INTERVAL); // REFRESH_INTERVAL
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