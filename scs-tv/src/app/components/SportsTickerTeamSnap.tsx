// const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1l-oTjaJQxTiNFWCR-RAU7nSvCvNg4Br6G36Je8bmLtU/pub?output=csv';
// const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vRfv4TOxblDhrnqwloIDae8HZsBKeusaw-ApaYqsMHXms06B9kGpZAxNgiCLYXc2G5fATyUMfugbgE4/pub?output=csv`;

// pages/index.js or your component file
"use client";
import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBasketball,
  faRunning,
  faSoccerBall,
  faFootball,
  faTrophy,
  faVolleyball,
} from "@fortawesome/free-solid-svg-icons";
import { REFRESH_INTERVAL } from "../utils/time";

export const renderSportsIcon = (leagueName: string) => {
    if (!leagueName) return null;
    const name = leagueName.toLowerCase();
    if (name.includes("volleyball"))
      return <FontAwesomeIcon icon={faVolleyball} className="mr-2" />;
    if (name.includes("basketball"))
      return <FontAwesomeIcon icon={faBasketball} className="mr-2" />;
    if (name.includes("soccer"))
      return <FontAwesomeIcon icon={faSoccerBall} className="mr-2" />;
    if (name.includes("track"))
      return <FontAwesomeIcon icon={faRunning} className="mr-2" />;
    if (name.includes("football"))
      return <FontAwesomeIcon icon={faFootball} className="mr-2" />;
    return null;
  };


// Helper function for formatting date and time
  export const formatDateTime = (date: Date) => {
    if (!date) return '';
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let hour = date.getHours();
    const minute = date.getMinutes();
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    const minuteStr = minute < 10 ? `0${minute}` : `${minute}`;
    return `${month}/${day} at ${hour}:${minuteStr} ${ampm}`;
  };

export default function SportsTickerTeamSnap({ onError }: { onError?: () => void } = {}) {
  // Accept onError prop for error handling
  // Locally, this happens first...
  // https://auth.teamsnap.com/oauth/authorize?client_id=Kkm7dwljALFdkxCqRsXu_1ZCqICjr6kNEx7xiEkEIoY&redirect_uri=https://localhost:3000/&response_type=token

  // get the access_token from the URL site.com/#access_token=RGrTMC4p-H0TGMy-Rit0Z8gxyHcv0UUp0yIqf6LhQJ4&token_type=Bearer
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [games, setGames] = useState<any[]>([]);

  useEffect(() => {
    async function fetchTeamSnapData() {
      try {
        if (!window.location.hash) return;
        const params = new URLSearchParams(window.location.hash.slice(1));
        const token = params.get('access_token');
        if (!token) return;

        // 1. Get programs from TeamSnap One v2 API
        const programsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/teamsnap/get-programs/?token=${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        const programsData = await programsRes.json();
        const programs = programsData.programs || [];
        console.log('📱 Programs fetched:', programs.length);

        // 2. Fetch schedules for all programs
        const allScheduleItems: any[] = [];
        for (const program of programs) {
          try {
            const scheduleRes = await fetch(
              `${process.env.NEXT_PUBLIC_BASE_URL}/api/teamsnap/get-schedule/?token=${token}&program_season_id=${program.id}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
              }
            );
            if (scheduleRes.ok) {
              const scheduleData = await scheduleRes.json();
              if (scheduleData.scheduleItems) {
                // Add program info to each schedule item
                const itemsWithProgram = scheduleData.scheduleItems.map((item: any) => ({
                  ...item,
                  program_name: program.name,
                  sport_name: program.sportName
                }));
                allScheduleItems.push(...itemsWithProgram);
              }
            }
          } catch (err) {
            console.error(`Error fetching schedule for program ${program.name}:`, err);
          }
        }

        // 3. Transform schedule items to game format - filter for games with scores
        const now = new Date();
        
        // Calculate current school year (July 1 - June 30)
        let schoolYearStart = new Date(now.getFullYear(), 6, 1);
        if (now < schoolYearStart) {
          schoolYearStart = new Date(now.getFullYear() - 1, 6, 1);
        }
        const schoolYearEnd = new Date(schoolYearStart.getFullYear() + 1, 5, 30);

        const gamesList = allScheduleItems
          .filter((item: any) => item.type === 'game') // Only games, not practices
          .map((item: any) => {
            // Parse date with time
            let startDate: Date | null = null;
            if (item.startDateTime) {
              startDate = new Date(item.startDateTime);
            } else if (item.startDate) {
              let hour = 0, minute = 0;
              if (item.startTime) {
                const timeParts = item.startTime.split(':');
                if (timeParts.length >= 1) hour = parseInt(timeParts[0], 10);
                if (timeParts.length >= 2) minute = parseInt(timeParts[1], 10);
              }
              const [year, month, day] = item.startDate.split('-').map(Number);
              startDate = new Date(year, month - 1, day, hour, minute, 0, 0);
            }

            // Extract team names from the game name
            // Example: "SPC Blue vs JUNIOR VARSITY - GREEN" or "Practice" or "Meet Name"
            let teamName = '';
            let opponent = '';
            if (item.name) {
              const nameParts = item.name.split(' vs ');
              if (nameParts.length === 2) {
                teamName = nameParts[0].trim();
                opponent = nameParts[1].trim();
              } else {
                // If there's no "vs", use the full name as teamName
                teamName = item.name;
              }
            } else if (item.teams && item.teams.length > 0) {
              // Try to get team names from teams array if available
              teamName = item.teams[0]?.name || item.program_name || '';
              if (item.teams.length > 1) {
                opponent = item.teams[1]?.name || '';
              }
            } else {
              teamName = item.program_name || '';
            }

            return {
              id: item.id,
              teamName: teamName,
              opponent: opponent,
              league_name: item.sport_name,
              date: startDate,
              time: startDate ? formatDateTime(startDate) : '',
              location: item.venueName || '',
              // v2 API may have score information
              result: item.result || null,
              pointsForTeam: item.scoreForTeam || null,
              pointsForOpponent: item.scoreAgainstTeam || null,
            };
          })
          .filter((game: any) => game.date && game.date >= schoolYearStart && game.date <= schoolYearEnd)
          .sort((a: any, b: any) => a.date.getTime() - b.date.getTime());

        setGames(gamesList);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        console.error("Error fetching TeamSnap data:", err);
        if (onError) onError();
      } finally {
        setLoading(false);
      }
    }
    fetchTeamSnapData();
    const interval = setInterval(fetchTeamSnapData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const currentGame = games[currentGameIndex];

  useEffect(() => {
    if (games.length === 0) return;
    const advanceToNextGame = () => {
      setIsAnimating(true);
      if (animationTimeoutRef.current)
        clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = setTimeout(() => {
        setCurrentGameIndex((prevIndex) => (prevIndex + 1) % games.length);
        setIsAnimating(false);
      }, 500);
    };
    const interval = setInterval(advanceToNextGame, 10000);
    return () => {
      clearInterval(interval);
      if (animationTimeoutRef.current)
        clearTimeout(animationTimeoutRef.current);
    };
  }, [games.length]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!games || games.length === 0) {
    return (
      <div className="flex gap-8 p-4 bg-gray-200">
        <section className="w-1/4 bg-emerald-800 text-white p-1 rounded font-bold">
          No games scheduled in the past week or next three weeks
        </section>
        <aside className="w-3/4 p-4">Check back later for upcoming games</aside>
      </div>
    );
  }

  

  
  const renderPlaceText = (place: string) => {
    if (!place) return;
    
    const placeNumber = parseInt(place);
    if (placeNumber === 1) return "1st place";
    if (placeNumber === 2) return "2nd place";
    if (placeNumber === 3) return "3rd place";
    if (placeNumber >= 4 && placeNumber <= 10) return `${placeNumber}th place`;
    return "";
  };

  return (
    <div className="flex gap-8 p-4 bg-ticker">
      <section className="w-[calc(25%+5rem)] bg-emerald-800 text-white p-4 rounded-lg font-bold text-xl">
        <span>
            <span className="text-sm uppercase opacity-75">
              Game
            </span>
            <div className="flex items-center gap-2">
              {renderSportsIcon(currentGame?.league_name)}
              <div className="flex flex-col">
                <span>{currentGame?.league_name || 'Upcoming'}</span>
                {currentGame?.opponent && (
                  <span className="text-sm">vs {currentGame?.opponent}</span>
                )}
              </div>
            </div>
        </span>
      </section>
      <aside className="w-3/4 pl-4 pr-4 overflow-hidden content-center">
        <div
          className={`transition-all duration-1000 text-white ${
            isAnimating
              ? "transform -translate-x-full opacity-0"
              : "transform translate-x-0 opacity-100"
          }`}
        >
          <div className="flex items-center gap-8">
            {currentGame?.date && (
              <div className="text-gray-500 text-2xl">
                {currentGame.date > new Date() ? "Upcoming: " : ""}
                {formatDateTime(currentGame.date)}
              </div>
            )}
            {currentGame?.result && (
              <div className="text-2xl">Final: {currentGame.result}</div>
            )}
            {currentGame?.pointsForTeam !== null && currentGame?.pointsForOpponent !== null && (
              <div className="flex items-center gap-2 text-2xl">
                <span>
                  {currentGame.teamName}: <span className="text-emerald-100">{currentGame.pointsForTeam}</span>
                  &nbsp;vs&nbsp;{currentGame.opponent}
                  &nbsp;<span className="text-emerald-100">{currentGame.pointsForOpponent}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
