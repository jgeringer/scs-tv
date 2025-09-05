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

        // 1. Get division (teams)
        const divisionRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/teamsnap/get-division/?token=${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        const divisionJson = await divisionRes.json();
        const teamIds = divisionJson.collection.items.map((item: any) => {
          return item.data.find((d: any) => d.name === "id")?.value;
        }).filter((id: any) => id !== undefined).join(',');

        // 2. Get events
        const eventsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/teamsnap/get-events/?token=${token}&team_id=${teamIds}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        const eventsJson = await eventsRes.json();
        const eventItems = eventsJson.collection.items;

        // 3. Get division locations
        const divisionLocationIds = eventItems.map((item: any) => {
          return item.data.find((d: any) => d.name === "division_location_id")?.value;
        }).filter((id: any) => id !== null).join(',');
        const divisionLocationsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/teamsnap/get-division-locations/?token=${token}&divisionLocations=${divisionLocationIds}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        const divisionLocationsJson = await divisionLocationsRes.json();
        const locationMap: Record<string, any> = {};
        divisionLocationsJson.collection.items.forEach((item: any) => {
          const id = item.data.find((d: any) => d.name === "id")?.value;
          locationMap[id] = item.data.find((d: any) => d.name === "name")?.value;
        });

        // Combine event data
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const twoWeeksAgo = new Date(now);
        twoWeeksAgo.setDate(now.getDate() - 14);

        const gamesList = eventItems
          .map((item: any) => {
            const data = Object.fromEntries(item.data.map((d: any) => [d.name, d.value]));
            const teamObj = divisionJson.collection.items.find((t: any) => t.data.find((d: any) => d.name === "id")?.value === data.team_id);
            const teamName = teamObj?.data.find((d: any) => d.name === "name")?.value;
            const leagueName = teamObj?.data.find((d: any) => d.name === "league_name")?.value;
            return {
              id: data.id,
              teamId: data.team_id,
              opponentId: data.opponent_id,
              opponent: data.opponent_name,
              teamName,
              league_name: leagueName,
              date: data.start_date ? new Date(data.start_date) : null,
              time: data.start_date ? new Date(data.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
              location: data.division_location_id ? locationMap[data.division_location_id] : '',
              result: data.formatted_results,
              pointsForTeam: data.points_for_team,
              pointsForOpponent: data.points_for_opponent,
            };
          })
          .filter((game: any) => game.result)
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
            {currentGame?.teamId &&
              (() => {
              const team = games.find(
                (g) => g.teamId === currentGame.teamId
              );
              // Find the team in divisionJson to get league_name
              // Since divisionJson is only available in fetchTeamSnapData, we need to store league_name in games
              // So, update fetchTeamSnapData to include league_name in each game object
              return team?.league_name || "";
              })()
            }
            </span>
            <div>
              {renderSportsIcon(currentGame?.league_name)}
              {currentGame?.teamName}
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
