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

        // 1. Get division (teams)
        const divisionRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/teamsnap/get-division/?token=${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        const divisionJson = await divisionRes.json();
        const teamIds = divisionJson.collection.items.map((item: any) => {
          return item.data.find((d: any) => d.name === "id")?.value;
        }).filter((id: any) => id !== undefined).join(',');

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

        // 3. Get division locations
        const divisionLocationIds = eventItems.map((item: any) => {
          return item.data.find((d: any) => d.name === "division_location_id")?.value;
        }).filter((id: any) => id !== null).join(',');
        const divisionLocationsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/teamsnap/get-division-locations/?token=${token}&divisionLocations=${divisionLocationIds}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        const divisionLocationsJson = await divisionLocationsRes.json();
        const locationMap: Record<string, any> = {};
        divisionLocationsJson.collection.items.forEach((item: any) => {
          const id = item.data.find((d: any) => d.name === "id")?.value;
          locationMap[id] = item.data.find((d: any) => d.name === "name")?.value;
        });

        // Combine event data
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const eventsList = eventItems
          .map((item: any) => {
            const data = Object.fromEntries(item.data.map((d: any) => [d.name, d.value]));
            const dateObj = data.start_date ? new Date(data.start_date) : null;
            const teamObj = divisionJson.collection.items.find((t: any) => t.data.find((d: any) => d.name === "id")?.value === data.team_id);
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
          .filter((event: any) => event && event.dateObject && event.dateObject >= tomorrow)
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
  // Filter for only upcoming events
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const upcomingEvents = events.filter(e => e.dateObject && e.dateObject >= now);

  if (upcomingEvents.length === 0) {
    return <div className="text-gray-500">No upcoming events</div>;
  }

  return (
    <ol ref={listRef} className="space-y-4 max-h-[calc(100vh-400px)] pr-2 pb-10 pt-5 gradient-list">
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
                  <span className="mr-2 w-[30px]">
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
  );
}