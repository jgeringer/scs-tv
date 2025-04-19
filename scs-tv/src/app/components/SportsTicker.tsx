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

export default function SportsTicker() {
  const [allSheetsData, setAllSheetsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/sheets-data");
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const jsonData = await response.json();
        console.log('💥💥💥 SportsTicker fetching data::::', jsonData);
        setAllSheetsData(jsonData);
      } catch (err) {
        // @ts-ignore - TypeScript doesn't know about the error type
        setError(err);
        console.error("Error fetching Google Sheets data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();

    // run this every 1 minute so that we can update the data when more is added
    const interval = setInterval(() => {
      fetchData();
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Flatten all games from all sheets
  const now = new Date();
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);
  const threeWeeksAhead = new Date(now);
  threeWeeksAhead.setDate(now.getDate() + 21);

  // Adapt to new data structure
  const allGames = Object.entries(allSheetsData)
    .flatMap(([sheetName, games]) =>
      (games as any[])
        .filter((game) => {
          const gameDate = new Date(game.Date);
          return gameDate >= oneWeekAgo && gameDate <= threeWeeksAhead;
        })
        .map((game) => ({
          ...game,
          teamName: sheetName,
        }))
    )
    .sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());

  const currentGame = allGames[currentGameIndex];

  useEffect(() => {
    if (allGames.length === 0) return;
    const advanceToNextGame = () => {
      setIsAnimating(true);
      if (animationTimeoutRef.current)
        clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = setTimeout(() => {
        setCurrentGameIndex((prevIndex) => (prevIndex + 1) % allGames.length);
        setIsAnimating(false);
      }, 500);
    };
    const interval = setInterval(advanceToNextGame, 10000);
    return () => {
      clearInterval(interval);
      if (animationTimeoutRef.current)
        clearTimeout(animationTimeoutRef.current);
    };
  }, [allGames.length]);

  if (loading) return <div>Loading...</div>;

  // @ts-ignore - TypeScript doesn't know about the error type either
  if (error) return <div>Error: {error.message}</div>;
  if (allGames.length === 0) {
    return (
      <div className="flex gap-8 p-4 bg-gray-200">
        <section className="w-1/4 bg-emerald-800 text-white p-1 rounded font-bold">
          No games scheduled in the past week or next three weeks
        </section>
        <aside className="w-3/4 p-4">Check back later for upcoming games</aside>
      </div>
    );
  }

  // Helper functions (adapted for new field names)
  const formatDateTime = (dateString: string, timeString: string) => {
    const date = new Date(`${dateString} ${timeString}`);
    const options = {
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    } as const;
    return date
      .toLocaleDateString("en-US", options)
      .replace(/,\s/, " at ")
      .replace(/:00$/, "");
  };

  const renderSportsIcon = (teamName: string) => {
    if (teamName.startsWith("Volleyball"))
      return <FontAwesomeIcon icon={faVolleyball} className="mr-2" />;
    if (teamName.startsWith("Basketball"))
      return <FontAwesomeIcon icon={faBasketball} className="mr-2" />;
    if (teamName.startsWith("Soccer"))
      return <FontAwesomeIcon icon={faSoccerBall} className="mr-2" />;
    if (teamName.startsWith("Track"))
      return <FontAwesomeIcon icon={faRunning} className="mr-2" />;

    // Add more logic as needed: faRunning, faSoccerBall, faTrophy
    return null;
  };

  const renderPlaceText = (place: string) => {
    if (!place) return;
    if (place === "1") return "1st place";
    if (place === "2") return "2nd place";
    if (place === "3") return "3rd place";
    if (place >= "4" && place <= "10") return `${place}th place`;
    return "";
  };

  return (
    <div className="flex gap-8 p-4 bg-ticker">
      <section className="w-[calc(25%+5rem)] bg-emerald-800 text-white p-4 rounded-lg font-bold text-xl">
        <span>
          {renderSportsIcon(currentGame.teamName)}
          {currentGame.Meet} {currentGame.teamName} - {currentGame.Grade} Grade{" "}
          {currentGame.Gender}
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
            {currentGame.Date && (
              <div className="text-gray-500 text-2xl">
                {new Date(currentGame.Date) > new Date() ? "Upcoming: " : ""}
                {formatDateTime(currentGame.Date, currentGame.Time)}
              </div>
            )}
            {currentGame.Place && (
              <div className="flex items-center gap-2 text-2xl">
                Final:{" "}
                <span className="bg-emerald-800 text-white p-2 rounded">
                  <FontAwesomeIcon icon={faTrophy} width="32" />
                  &nbsp;
                  {renderPlaceText(currentGame.Place)}
                </span>
              </div>
            )}
            {currentGame["SCS Score"] && currentGame["Opponent Score"] && (
              <div className="flex items-center gap-2 text-2xl">
                {currentGame["SCS Score"] > currentGame["Opponent Score"] && (
                  <span className="bg-emerald-800 text-white p-2 rounded">
                    W
                  </span>
                )}
                <span>
                  Final - Celtics&nbsp;
                  <span className="text-emerald-100">
                    {currentGame["SCS Score"]}
                  </span>
                  &nbsp;vs&nbsp;{currentGame.Opponent}
                  &nbsp;
                  <span className="text-emerald-100">
                    {currentGame["Opponent Score"]}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
