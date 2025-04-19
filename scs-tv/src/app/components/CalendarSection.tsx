'use client';

import { useState, useEffect } from 'react';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Define the event type based on the Google Sheets data structure
interface CalendarEvent {
  id: string;
  title: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  description?: string;
  location?: string;
  formattedDate?: {
    day: string;
    monthShort: string;
    weekdayShort: string;
  };
}

export default function CalendarSection() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        // Fetch data from the sheets-data API instead of calendar API
        const response = await fetch('/api/sheets-data');
        
        if (!response.ok) {
          throw new Error('Failed to fetch events data');
        }
        
        const data = await response.json();
        
        console.log(`💥💥💥 data::::`, data);
        // Transform the sheets data into calendar events
        // Assuming there's a sheet named "Calendar" or similar
        const calendarSheet = data['Calendar'] || data['Events'] || Object.values(data)[0];
        
        if (!calendarSheet || !Array.isArray(calendarSheet)) {
          throw new Error('No calendar data found');
        }
        
        // Map the sheet data to calendar events
        const calendarEvents: CalendarEvent[] = calendarSheet.map((row: any, index: number) => {
          // Adjust these field names based on your actual sheet structure
          console.log(`💥💥💥 row:`, row);
          return {
            id: `event-${index}`,
            sport: Object.keys(data)[0],
            // title: row['Title'] || row['Event'] || row['Name'] || 'Untitled Event',
            title: Object.keys(data)[0] + ' - ' + row['Grade'] + ' Grade ' + row['Gender'] + ' vs ' + row['Opponent'] || 'Untitled Event',
            start: {
              dateTime: row['Date'] && row['Time'] ? `${row['Date']}T${row['Time']}` : undefined,
              date: row['Date'] || undefined
            },
            description: row['Description'] || row['Details'] || '',
            location: row['Location'] || row['Place'] || '',
            formattedDate: {
              day: row['Date']?.split('/')[1] || '',
              monthShort: row['Date']?.split('/')[0] || '',
              weekdayShort: row['Date']?.split('/')[2] || ''
            }
          };
        });
        
        setEvents(calendarEvents);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return (
    <>
      {loading ? (
        <div>Loading events...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="component rounded-2xl p-8 h-[100%] bottom-gradient overflow-hidden">
          <h2 className="text-xl font-bold text-white tracking-wide pb-4 eyebrow"><FontAwesomeIcon icon={faCalendar} width="32" /> Upcoming athletics events</h2>
          <CalendarList events={events} />
        </div>
      )}
    </>
  );
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


// CalendarList component
function CalendarList({ events }: { events: CalendarEvent[] }) {
  if (events.length === 0) {
    return <div className="text-gray-500">No upcoming events</div>;
  }

  return (
    <ol className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
      {events.map((event) => {
        console.log(`💥💥💥 event:`, event);
        
        // Use the formattedDate property if available, otherwise fall back to manual parsing
        const day = event.formattedDate?.day || event.start.date?.split('/')[1];
        const monthShort = months[parseInt(event.formattedDate?.monthShort || event.start.date?.split('/')[0]) - 1];
        const weekdayShort = weekdays[parseInt(event.formattedDate?.weekdayShort || event.start.date?.split('/')[2])];

        return (
          <li key={event.id} className="flex items-start gap-4">
            <div className="flex-shrink-0 w-16 text-center bg-emerald-800 text-white rounded-lg p-2">
              <div className="text-2xl font-bold">{day}</div>
              <div className="text-sm">{monthShort}</div>
              <div className="text-xs">{weekdayShort}</div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{event.title}</h3>
              <div className="text-gray-600">
                {event.location && ` • ${event.location}`}
              </div>
              {event.description && (
                <p className="text-gray-700 mt-1">{event.description}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
} 