'use client';

import { useState, useEffect, useRef, use } from 'react';
import type { SportsTicker } from '../utils/contentful';
import { Game } from '../utils/contentful';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRunning, faSoccerBall, faTrophy, faVolleyball } from '@fortawesome/free-solid-svg-icons';

interface SportsTickerProps {
  sportsTicker: SportsTicker;
}

export default function SportsTicker({ sportsTicker }: SportsTickerProps) {
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get the current date
  const now = new Date();
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);
  const threeWeeksAhead = new Date(now);
  threeWeeksAhead.setDate(now.getDate() + 21);

  // Filter games within the past week and next three weeks and sort by date
  const allGames = sportsTicker.teams.flatMap(team =>
    team.games
      .filter(game => {
        const gameDate = new Date(game.date);
        return gameDate >= oneWeekAgo && gameDate <= threeWeeksAhead;
      })
      .map(game => ({
        ...game,
        teamName: team.name
      }))
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date

  // If no games in the specified range, show a message
  if (allGames.length === 0) {
    return (
      <div className="flex gap-8 p-4 bg-gray-200">
        <section className="w-1/4 bg-emerald-800 text-white p-1 rounded font-bold">
          No games scheduled in the past week or next three weeks
        </section>
        <aside className="w-3/4 p-4">
          Check back later for upcoming games
        </aside>
      </div>
    );
  }

  // Get current game
  const currentGame = allGames[currentGameIndex];

  // Function to advance to the next game
  const advanceToNextGame = () => {
    setIsAnimating(true);

    // Clear any existing timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    // Set a timeout to advance to the next game after animation
    animationTimeoutRef.current = setTimeout(() => {
      setCurrentGameIndex((prevIndex) => (prevIndex + 1) % allGames.length);
      setIsAnimating(false);
    }, 500); // Half a second for the animation
  };

  // Set up interval to advance games
  useEffect(() => {
    const interval = setInterval(() => {
      advanceToNextGame();
    }, 3000); // 3 seconds per game

    return () => {
      clearInterval(interval);
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [allGames.length]);


  const [isTeamChanging, setIsTeamChanging] = useState(1)

  const renderPlaceText = (place: number) => {
    if (!place) return;
    if (place === 1) {
      return "1st place";
    } else if (place === 2) {
      return "2nd place";
    } else if (place === 3) {
      return "3rd place";
    } else if (place >= 4 && place <= 10) {
      return `${place}th place`;
    }
    return ""; // Handle cases outside 1-10 if needed
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);

    const options = { month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    const formattedDate = date.toLocaleDateString('en-US', options).replace(/,\s/, ' at ').replace(/:00$/, '');

    return formattedDate; // Output: April 13, 2025 at 11am
  };

  const renderSportsIcon = (teamName) => {
    // Volleyball - 4th Grade - Girls
    // Track and Field - Junior Varsity
    // check the text that is before the "-"
    if (teamName.startsWith("Volleyball")) {
      return <FontAwesomeIcon icon={faVolleyball} className='mr-2' />
    } else if (teamName.startsWith("Track") || teamName.startsWith("Cross")) {
      return <FontAwesomeIcon icon={faRunning} className='mr-2' />
    } else if (teamName.startsWith("Basketball")) {
      return <FontAwesomeIcon icon={faRunning} className='mr-2' />
    } else if (teamName.startsWith("Soccer")) {
      return <FontAwesomeIcon icon={faSoccerBall} className='mr-2' />
    }
  }

  console.log('currentGame:', currentGame)
  console.log('currentGame.opponentScore:', currentGame.opponentScore)

  return (
    <div className="flex gap-8 p-4 bg-ticker">
      <section
        className={`w-1/4 bg-emerald-800 text-white p-4 rounded-lg font-bold text-xl`}
      >
        <span>
          {renderSportsIcon(currentGame.teamName)}
          {currentGame.teamName}
        </span>
    </section>
      <aside className="w-3/4 pl-4 pr-4 overflow-hidden content-center">
        <div
          className={`transition-all duration-1000 text-white ${isAnimating ? 'transform -translate-x-full opacity-0' : 'transform translate-x-0 opacity-100'}`}
        >
          <div className="flex items-center gap-8">
            {currentGame.date && (
              <div className="text-gray-500 text-2xl">
                {new Date(currentGame.date) > new Date() ? "Upcoming: " : ""}
                {formatDateTime(currentGame.date)}
              </div>
            )}

            {currentGame.place && (
              <div className="flex items-center gap-2 text-2xl">
                Final: <span className='bg-emerald-800 text-white p-2 rounded'>
                  <FontAwesomeIcon icon={faTrophy} width="32" />&nbsp;
                 {renderPlaceText(currentGame.place)}</span>
              </div>
            )}

            {currentGame.opponent && (
              <div className="flex items-center gap-2 text-2xl">
                {currentGame.scsScore > currentGame.opponentScore && (
                  <span className='bg-emerald-800 text-white p-2 rounded'>W</span>
                )}                
                <span>{currentGame.scsScore && `Final - `}Celtics
                  {!!currentGame.scsScore && (
                    <span className='text-emerald-100'>
                      &nbsp;{currentGame.scsScore}</span>
                  )} {!!currentGame.location && (
                    <span>{!!currentGame.location ? 'vs ' : '@ '}</span>
                  )}
                  {currentGame.opponent}
                  {!!currentGame.opponentScore && (
                    <span className='text-emerald-100'>
                      &nbsp;{currentGame.opponentScore}</span>
                  )}
                </span>
              </div>
            )}

          </div>
          <div>
          </div>
        </div>
      </aside>
    </div>
  );
}