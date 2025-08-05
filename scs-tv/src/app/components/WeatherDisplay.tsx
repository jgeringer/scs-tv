'use client';

import { useState, useEffect } from 'react';

interface WeatherData {
    temperature: number;
    description: string;
    icon: string;
}

export default function WeatherDisplay() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchWeather = async () => {
        try {
            const response = await fetch('/api/weather');
            if (!response.ok) {
                throw new Error('Weather data fetch failed');
            }
            const data = await response.json();
            setWeather(data);
        } catch (error) {
            console.error('Error fetching weather:', error);
            setWeather(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch weather on component mount
        fetchWeather();

        // Set up interval to refresh weather every hour (60 minutes * 60 seconds * 1000 milliseconds)
        const interval = setInterval(() => {
            fetchWeather();
        }, 60 * 60 * 1000);

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return <div>Loading weather...</div>;
    }

    if (!weather) {
        return <div>Weather data unavailable</div>;
    }

    return (
        <div className="flex items-center space-x-2">
            <img
                src={`http://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                alt={weather.description}
                width={50}
                height={50}
            />
            <span>
                {weather.temperature}°F - {weather.description}
            </span>
        </div>
    );
} 