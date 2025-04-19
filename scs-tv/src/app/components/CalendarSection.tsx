'use client';

import { useState, useEffect, useRef } from 'react';
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
    time: string;
  };
  dateObject?: Date;
}

export default function CalendarSection() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

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
        // Look for sheets that might contain game data
        const gameSheets = Object.entries(data)
          .filter(([sheetName]) => 
            sheetName.includes('Basketball') || 
            sheetName.includes('Volleyball') || 
            sheetName.includes('Soccer') || 
            sheetName.includes('Track')
          );
        
        if (gameSheets.length === 0) {
          throw new Error('No game sheets found in the spreadsheet');
        }
        
        // Extract all games from all sheets
        const allGames: CalendarEvent[] = [];
        
        // Get current date for filtering past events
        const now = new Date();
        // Set to beginning of today to include today's events
        now.setHours(0, 0, 0, 0);
        
        // Process all sheets and collect events
        gameSheets.forEach(([sheetName, sheetData]) => {
          if (!Array.isArray(sheetData)) return;
          
          // Map the sheet data to calendar events
          const games = sheetData.map((row: any, index: number) => {
            // Skip rows without a date
            if (!row['Date']) return null;
            
            // Create a more descriptive title
            const sport = sheetName.split(' ')[0]; // Get the sport name (e.g., "Basketball")
            const grade = row['Grade'] || 'N/A';
            const gender = row['Gender'] || 'N/A';
            const opponent = row['Opponent'] || 'TBD';
            const homeAway = row['Home / Away'] || 'Home';
            
            const title = `${sport} - ${grade} Grade ${gender}`;
            // Use "@" for away games and "vs" for home games
            const description = homeAway === 'Away' ? `@ ${opponent}` : `vs ${opponent}`;
            
            // Format the date properly
            const dateStr = row['Date'];
            const timeStr = row['Time'] || '';
            let dateObj: Date | null = null;
            let formattedTime = '';
            
            // Try to parse the date if it's not in ISO format
            try {
              // Check if the date is in MM/DD/YYYY format
              if (dateStr.includes('/')) {
                const [month, day, year] = dateStr.split('/').map(Number);
                if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
                  // Create date with explicit month (subtract 1 since months are 0-indexed)
                  dateObj = new Date(year, month - 1, day);
                }
              } else {
                dateObj = new Date(dateStr);
              }
              
              // Format time if available
              if (timeStr) {
                // Try to parse time in various formats
                const timeMatch = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
                if (timeMatch) {
                  let hours = parseInt(timeMatch[1]);
                  const minutes = timeMatch[2] ? timeMatch[2] : '00';
                  const ampm = timeMatch[3] ? timeMatch[3].toLowerCase() : '';
                  
                  // Convert to 12-hour format if needed
                  if (ampm === 'pm' && hours < 12) hours += 12;
                  if (ampm === 'am' && hours === 12) hours = 0;
                  
                  // Format time in 12-hour format with AM/PM
                  let displayHours = hours % 12;
                  if (displayHours === 0) displayHours = 12;
                  const period = hours < 12 ? 'am' : 'pm';
                  
                  formattedTime = `${displayHours}${minutes !== '00' ? ':' + minutes : ''}${period}`;
                } else {
                  // Try to parse 24-hour format
                  const timeParts = timeStr.split(':');
                  if (timeParts.length >= 1) {
                    let hours = parseInt(timeParts[0]);
                    const minutes = timeParts.length > 1 ? timeParts[1] : '00';
                    
                    // Convert to 12-hour format
                    let displayHours = hours % 12;
                    if (displayHours === 0) displayHours = 12;
                    const period = hours < 12 ? 'am' : 'pm';
                    
                    formattedTime = `${displayHours}${minutes !== '00' ? ':' + minutes : ''}${period}`;
                  } else {
                    formattedTime = timeStr;
                  }
                }
              }
            } catch (e) {
              console.warn(`Could not parse date: ${dateStr}`);
            }
            
            // Skip past events
            if (dateObj && dateObj < now) {
              return null;
            }
            
            // Extract day, month abbreviation, and weekday abbreviation
            let formattedDateInfo = {
              day: '',
              monthShort: '',
              weekdayShort: '',
              time: formattedTime
            };
            
            if (dateObj && !isNaN(dateObj.getTime())) {
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              
              formattedDateInfo = {
                day: dateObj.getDate().toString(),
                monthShort: months[dateObj.getMonth()],
                weekdayShort: weekdays[dateObj.getDay()],
                time: formattedTime
              };
            } else {
              // Fallback to manual parsing if date object is invalid
              const parts = dateStr.split('/');
              if (parts.length >= 2) {
                formattedDateInfo.day = parts[1];
                formattedDateInfo.monthShort = parts[0];
                formattedDateInfo.time = formattedTime;
              }
            }
            
            return {
              id: `game-${sheetName}-${index}`,
              title: title,
              start: {
                dateTime: dateObj && timeStr ? `${dateObj.toISOString().split('T')[0]}T${formattedTime}` : undefined,
                date: dateStr || undefined
              },
              description: description,
              location: row['Location'] || 'TBD',
              formattedDate: formattedDateInfo,
              // Store the actual Date object for sorting
              dateObject: dateObj
            } as CalendarEvent;
          }).filter((game): game is CalendarEvent => game !== null);
          
          allGames.push(...games);
        });
        
        // Sort by date using the stored dateObject
        const sortedEvents = allGames.sort((a, b) => {
          // Use the stored dateObject for comparison if available
          if (a.dateObject && b.dateObject) {
            return a.dateObject.getTime() - b.dateObject.getTime();
          }
          
          // Fallback to the previous sorting logic if dateObject is not available
          let dateA: Date;
          let dateB: Date;
          
          // Handle dateTime format
          if (a.start.dateTime) {
            dateA = new Date(a.start.dateTime);
          } else if (a.start.date) {
            // Parse MM/DD/YYYY format
            const [monthA, dayA, yearA] = a.start.date.split('/').map(Number);
            dateA = new Date(yearA, monthA - 1, dayA);
          } else {
            // Fallback to current date if no date is available
            dateA = new Date();
          }
          
          if (b.start.dateTime) {
            dateB = new Date(b.start.dateTime);
          } else if (b.start.date) {
            // Parse MM/DD/YYYY format
            const [monthB, dayB, yearB] = b.start.date.split('/').map(Number);
            dateB = new Date(yearB, monthB - 1, dayB);
          } else {
            // Fallback to current date if no date is available
            dateB = new Date();
          }
          
          // Compare dates
          return dateA.getTime() - dateB.getTime();
        });
        
        // Log sorted events to verify sorting
        console.log('Sorted events by date:', sortedEvents.map(event => ({
          title: event.title,
          date: event.start.dateTime || event.start.date,
          formattedDate: event.formattedDate
        })));
        
        setEvents(sortedEvents);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    if (events.length === 0) return;
    
    // Initialize item refs array
    itemRefs.current = new Array(events.length).fill(null);
    
    const scrollInterval = setInterval(() => {
      // Move to the next item
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % events.length;
        
        // Scroll the active item into view
        if (itemRefs.current[nextIndex] && listRef.current) {
          itemRefs.current[nextIndex]?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
        
        return nextIndex;
      });
    }, 6000); // 20 seconds per item
    
    return () => clearInterval(scrollInterval);
  }, [events]);

  return (
    <>
      {loading ? (
        <div>Loading events...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="component rounded-2xl p-8 h-[100%] bottom-gradient overflow-hidden">
          <h2 className="text-xl font-bold text-white tracking-wide pb-4 eyebrow"><FontAwesomeIcon icon={faCalendar} width="32" /> Upcoming athletics events</h2>
          <CalendarList 
            events={events} 
            listRef={listRef as React.RefObject<HTMLOListElement>} 
            itemRefs={itemRefs} 
            activeIndex={activeIndex} 
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
  itemRefs, 
  activeIndex 
}: { 
  events: CalendarEvent[],
  listRef: React.RefObject<HTMLOListElement>,
  itemRefs: React.MutableRefObject<(HTMLLIElement | null)[]>,
  activeIndex: number
}) {
  if (events.length === 0) {
    return <div className="text-gray-500">No upcoming events</div>;
  }

  return (
    <ol ref={listRef} className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
      {events.map((event, index) => {
        console.log(`💥💥💥 event:`, event);
        
        // Use the formattedDate property if available, otherwise fall back to manual parsing
        const day = event.formattedDate?.day || event.start.date?.split('/')[1] || '';
        const monthShort = event.formattedDate?.monthShort || '';
        const time = event.formattedDate?.time || '';

        return (
          <li 
            key={event.id} 
            ref={(el) => { itemRefs.current[index] = el; }}
            className={`flex items-start gap-4 transition-opacity duration-500 ${index === activeIndex ? 'opacity-100' : 'opacity-50'}`}
          >
            <div className="flex-shrink-0 w-16 text-center bg-emerald-800 text-white rounded-lg p-2">
              <div className="text-2xl font-bold">{day}</div>
              <div className="text-sm">{monthShort}</div>
              <div className="text-xs">{time}</div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{event.title}</h3>
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