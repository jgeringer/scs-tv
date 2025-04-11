import { CalendarEvent } from '../utils/calendar';

interface CalendarListProps {
  events: CalendarEvent[];
}

export default function CalendarList({ events }: CalendarListProps) {
  if (events.length === 0) {
    return <div className="text-gray-500">No upcoming events</div>;
  }

  return (
    <ol className="space-y-2">
      {events.map((event) => {
        // Format the date and time
        const startDate = new Date(event.start.dateTime);
        const formattedDate = startDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
        const formattedTime = startDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        });

        return (
          <li key={event.id} className="border-b pb-2">
            <div className="font-semibold">{event.summary}</div>
            <div className="text-sm text-gray-600">
              {formattedDate} at {formattedTime}
            </div>
            {event.location && (
              <div className="text-sm text-gray-500">
                📍 {event.location}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
} 