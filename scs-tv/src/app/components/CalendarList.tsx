import { CalendarEvent } from '../utils/calendar';

interface CalendarListProps {
  events: CalendarEvent[];
}

export default function CalendarList({ events }: CalendarListProps) {
  if (events.length === 0) {
    return <div className="text-gray-500">No upcoming events</div>;
  }

  return (
    <ol className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
      {events.map((event) => {
        // Handle both dateTime and date fields
        const startDate = event.start.dateTime
          ? new Date(event.start.dateTime)
          : new Date(event.start.date + 'T00:00:00'); // Add time for all-day events

        const day = startDate.toLocaleDateString('en-US', { day: 'numeric' });
        const monthShort = startDate.toLocaleDateString('en-US', { month: 'short' });
        const weekdayShort = startDate.toLocaleDateString('en-US', { weekday: 'short' });

        // Only show time if it's not an all-day event
        const formattedTime = event.start.dateTime
          ? startDate.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })
          : 'All Day';

        return (
          <li key={event.id} className="flex border-b pb-4">
            {/* Calendar Box */}
            <div className="bg-white rounded-md p-2 w-20 flex flex-col items-center justify-center mr-4 float-left border text-gray-600">
              <div className="text-xs font-semibold text-gray-600">{weekdayShort.toUpperCase()}</div>
              <div className="text-2xl font-bold">{day}</div>
              <div className="text-sm text-gray-600">{monthShort}</div>
            </div>

            {/* Event Details */}
            <div className="flex-grow">
              <div className="font-semibold text-xl">{event.summary}</div>
              <div className="text-lg text-gray-600">
                {formattedTime !== 'All Day' && `at ${formattedTime}`}
              </div>
              {event.location && (
                <div className="text-sm text-gray-500">
                  {event.location}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}