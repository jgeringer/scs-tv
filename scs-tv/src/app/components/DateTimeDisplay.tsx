'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '../utils/date';
import { formatTime } from '../utils/time';

export default function DateTimeDisplay() {
  const [date, setDate] = useState(formatDate());
  const [time, setTime] = useState(formatTime());

  useEffect(() => {
    // Update time every 1 minute
    const interval = setInterval(() => {
      setDate(formatDate());
      setTime(formatTime());
    }, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div>{date} &nbsp; - &nbsp; {time}</div>
    </>
  );
} 