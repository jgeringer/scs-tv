export async function getWeather() {
  try {
    // You'll need to replace YOUR_API_KEY with an actual OpenWeatherMap API key
    const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    const city = 'Elmwood Park';
    const state = 'IL';
    const country = 'US';
    
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city},${state},${country}&units=imperial&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Weather data fetch failed');
    }
    
    const data = await response.json();
    return {
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
} 