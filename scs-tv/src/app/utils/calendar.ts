export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone: string;
  };
  location?: string;
}

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    // Fetch events from our API route
    const response = await fetch('/api/calendar');
    
    if (!response.ok) {
      throw new Error('Failed to fetch calendar events');
    }
    
    const data = await response.json();
    return data.events as CalendarEvent[] || [];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
} 