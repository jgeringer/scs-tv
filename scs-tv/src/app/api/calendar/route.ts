import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
  try {
    // Check if we have the required environment variables
    if (!process.env.GOOGLE_CALENDAR_API_KEY || !process.env.GOOGLE_CALENDAR_ID) {
      console.error('Missing Google Calendar API credentials');
      return NextResponse.json({ events: [] });
    }

    // Create a Google Calendar API client
    const calendar = google.calendar({ version: 'v3', auth: process.env.GOOGLE_CALENDAR_API_KEY });
    
    // Get the current date and date 7 days from now
    const now = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(now.getDate() + 7);
    
    // Format dates for the API
    const timeMin = now.toISOString();
    const timeMax = oneWeekFromNow.toISOString();
    
    // Fetch events from the calendar
    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    // Return the events
    return NextResponse.json({ events: response.data.items || [] });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json({ events: [] });
  }
} 