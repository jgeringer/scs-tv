'use client';

import { useState, useEffect } from 'react';
import { formatTime } from '../utils/time';

export default function TimeDisplay() {
  const [time, setTime] = useState(formatTime());

  useEffect(() => {
    // Update time every 30 seconds
    const interval = setInterval(() => {
      setTime(formatTime());
    }, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return <div>{time}</div>;
} 