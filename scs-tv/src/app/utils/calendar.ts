export interface CalendarEvent {
  id: string;
  title: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  description?: string;
  location?: string;
  sport?: string;
  tabTitle?: string;
  gameInfo?: {
    homeAway?: string;
    sport?: string;
  };
  row?: {
    sport?: string;
    [key: string]: any;
  };
  formattedDate?: {
    day?: number;
    monthShort?: string;
    weekdayShort?: string;
  };
}

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    // Fetch data from the sheets-data API instead of calendar API
    const response = await fetch('/api/sheets-data');
    
    if (!response.ok) {
      throw new Error('Failed to fetch events data');
    }
    
    const data = await response.json();
    
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
      console.warn('No game sheets found in the spreadsheet');
      return [];
    }
    
    // Extract all games from all sheets
    const allGames: CalendarEvent[] = [];
    
    gameSheets.forEach(([sheetName, sheetData]) => {
      if (!Array.isArray(sheetData)) return;
      
      // Map the sheet data to calendar events
      const games = sheetData.map((row: any, index: number) => {
        // Skip rows without a date
        if (!row['Date']) return null;
        
        // Format the date properly
        const dateStr = row['Date'];
        let formattedDate = dateStr;
        let dateObj: Date | null = null;
        
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
          
          if (dateObj && !isNaN(dateObj.getTime())) {
            formattedDate = dateObj.toISOString().split('T')[0];
          } else {
            dateObj = null;
          }
        } catch (e) {
          console.warn(`Could not parse date: ${dateStr}`);
        }
        
        // Create a more descriptive title
        const sport = sheetName.split(' ')[0]; // Get the sport name (e.g., "Basketball")
        const grade = row['Grade'] || 'N/A';
        const gender = row['Gender'] || 'N/A';
        const opponent = row['Opponent'] || 'TBD';
        const homeAway = row['Home / Away'] || 'TBD';
        
        const title = `${sport} - ${grade} Grade ${gender}`;
        const description = `vs ${opponent}`;
        
        // Extract day, month abbreviation, and weekday abbreviation
        let formattedDateInfo = {};
        if (dateObj) {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          
          formattedDateInfo = {
            day: dateObj.getDate(),
            monthShort: months[dateObj.getMonth()],
            weekdayShort: weekdays[dateObj.getDay()]
          };
        }
        
        return {
          id: `game-${sheetName}-${index}`,
          title: title,
          sport: sport,
          tabTitle: sheetName, // Include the full tab title
          start: {
            dateTime: formattedDate && row['Time'] ? `${formattedDate}T${row['Time']}` : undefined,
            date: formattedDate || undefined
          },
          description: description,
          location: row['Location'] || 'TBD',
          gameInfo: {
            homeAway: homeAway,
            sport: sport
          },
          row: {
            ...row,
            sport: sport
          },
          formattedDate: formattedDateInfo
        } as CalendarEvent;
      }).filter((game): game is CalendarEvent => game !== null);
      
      allGames.push(...games);
    });
    
    // Sort by date
    return allGames.sort((a, b) => {
      const dateA = a.start.dateTime ? new Date(a.start.dateTime) : new Date(a.start.date + 'T00:00:00');
      const dateB = b.start.dateTime ? new Date(b.start.dateTime) : new Date(b.start.date + 'T00:00:00');
      return dateA.getTime() - dateB.getTime();
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
} 