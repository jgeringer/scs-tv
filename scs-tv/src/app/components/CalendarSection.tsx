'use client';

import { useState, useEffect } from 'react';
import { CalendarEvent, getCalendarEvents } from '../utils/calendar';
import CalendarList from './CalendarList';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
      } catch {
        setError('Failed to load calendar events');
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return (
    <>
      {loading ? (
        <div>Loading calendar events...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="component rounded-2xl p-8 h-[100%] bottom-gradient overflow-hidden">
          <h2 className="text-3xl font-bold text-white tracking-wide pb-4 eyebrow"><FontAwesomeIcon icon={faCalendar} width="32" /> Upcoming school events</h2>
          <CalendarList events={events} />
        </div>
      )}
    </>
  );
} 