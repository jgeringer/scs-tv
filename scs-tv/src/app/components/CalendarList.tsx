import { CalendarEvent } from '../utils/calendar';

interface CalendarListProps {
  events: CalendarEvent[];
}

export default function CalendarList({ events }: CalendarListProps) {
  if (events.length === 0) {
    return <div className="text-gray-500">No upcoming events</div>;
  }

  return (
    <ol className="space-y-2 max-h-[calc(100vh-340px)] overflow-y-auto pr-2">
      {events.map((event) => {
        // Handle both dateTime and date fields
        const startDate = event.start.dateTime 
          ? new Date(event.start.dateTime)
          : new Date(event.start.date + 'T00:00:00'); // Add time for all-day events
        
        const formattedDate = startDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });

        // Only show time if it's not an all-day event
        const formattedTime = event.start.dateTime 
          ? startDate.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })
          : 'All Day';

        return (
          <li key={event.id} className="border-b pb-2">
            <div className="font-semibold text-xl">{event.summary}</div>
            <div className="text-lg text-gray-600">
              {formattedDate} {formattedTime !== 'All Day' && `at ${formattedTime}`}
            </div>
            {event.location && (
              <div className="text-sm text-gray-500">
                {event.location}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
} 