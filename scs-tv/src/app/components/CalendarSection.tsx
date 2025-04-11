'use client';

import { useState, useEffect } from 'react';
import { CalendarEvent, getCalendarEvents } from '../utils/calendar';
import CalendarList from './CalendarList';

export default function CalendarSection() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const calendarEvents = await getCalendarEvents();
        setEvents(calendarEvents);
        setLoading(false);
      } catch (err) {
        setError('Failed to load calendar events');
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Calendar</h2>
      {loading ? (
        <div>Loading calendar events...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <CalendarList events={events} />
      )}
    </div>
  );
} 