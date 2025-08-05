import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    const city = 'Elmwood Park';
    const state = 'IL';
    const country = 'US';
    
    if (!API_KEY) {
      throw new Error('Weather API key not found');
    }
    
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city},${state},${country}&units=imperial&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Weather data fetch failed');
    }
    
    const data = await response.json();
    const weatherData = {
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon
    };
    
    return NextResponse.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
} 