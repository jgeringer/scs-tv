"use client";

// @ts-nocheck: just dont check this file
import Image from "next/image";
import { formatDate } from "./utils/date";
import CalendarSection from "./components/CalendarSection";
import TimeDisplay from "./components/TimeDisplay";
import WeatherDisplay from "./components/WeatherDisplay";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SportsTicker from "./components/SportsTicker";
import FadingGallery from "./components/FadingGallery";
import FolderModal from "./components/FolderModal";
import SportsTickerTeamSnapWrapper from "./components/SportsTickerTeamSnapWrapper";

import {
  faBasketball,
  faCamera,
  faNewspaper,
  faRunning,
  faSoccerBall,
  faVolleyball,
} from "@fortawesome/free-solid-svg-icons";
import { faPersonRunning } from "@fortawesome/free-solid-svg-icons/faPersonRunning";
import DateTimeDisplay from "./components/DateTimeDisplay";
import { useState, useEffect } from "react";

// Sheet ID: 1l-oTjaJQxTiNFWCR-RAU7nSvCvNg4Br6G36Je8bmLtU
// https://docs.google.com/spreadsheets/d/e/2PACX-1vRfv4TOxblDhrnqwloIDae8HZsBKeusaw-ApaYqsMHXms06B9kGpZAxNgiCLYXc2G5fATyUMfugbgE4/pub?output=csv

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [folderExpiry, setFolderExpiry] = useState<number | null>(null);

  // Check if selected folder has expired on mount and on an interval
  useEffect(() => {
    const checkExpiry = () => {
      const storedExpiry = localStorage.getItem('folderExpiry');
      const storedFolderId = localStorage.getItem('selectedFolderId');
      
      if (storedExpiry && storedFolderId) {
        const expiryTime = parseInt(storedExpiry, 10);
        const now = Date.now();
        
        if (now > expiryTime) {
          // Folder selection has expired
          localStorage.removeItem('selectedFolderId');
          localStorage.removeItem('folderExpiry');
          setSelectedFolderId(null);
          setFolderExpiry(null);
        } else {
          // Folder selection is still valid
          setSelectedFolderId(storedFolderId);
          setFolderExpiry(expiryTime);
        }
      }
    };

    checkExpiry();
    
    // Check expiry every minute
    const interval = setInterval(checkExpiry, 60000);
    return () => clearInterval(interval);
  }, []);

  // Listen for folder invalid events
  useEffect(() => {
    function handleFolderInvalid(e: Event) {
      const event = e as CustomEvent;
      console.warn('Folder is invalid or inaccessible:', event.detail.folderId);
      // Clear the invalid folder selection
      localStorage.removeItem('selectedFolderId');
      localStorage.removeItem('folderExpiry');
      setSelectedFolderId(null);
      setFolderExpiry(null);
    }

    window.addEventListener('folderInvalid', handleFolderInvalid as EventListener);
    return () => window.removeEventListener('folderInvalid', handleFolderInvalid as EventListener);
  }, []);

  const handleSelectFolder = (folderId: string | null, folderName: string) => {
    if (folderId === null) {
      // Clear folder selection to show all pictures (root folder)
      localStorage.removeItem('selectedFolderId');
      localStorage.removeItem('folderExpiry');
      setSelectedFolderId(null);
      setFolderExpiry(null);
    } else {
      // Set expiry time to 48 hours from now
      const expiryTime = Date.now() + 48 * 60 * 60 * 1000;
      
      localStorage.setItem('selectedFolderId', folderId);
      localStorage.setItem('folderExpiry', expiryTime.toString());
      
      setSelectedFolderId(folderId);
      setFolderExpiry(expiryTime);
    }
  };

  return (
    <div className="flex flex-col h-screen scs-gradient overflow-hidden">
      <FolderModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSelectFolder={handleSelectFolder}
        selectedFolderId={selectedFolderId}
        folderExpiry={folderExpiry}
      />
      
      <header className="flex justify-between items-center p-4 h-[100px] pl-8 pr-8">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-white tracking-wide flex items-center gap-4 main-text">
            <span 
              onClick={() => setIsModalOpen(true)}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              title="Click to change photo folder for 48 hours (useful for events like 8th grade night)"
            >
              <Image
                src="/shamrock.png"
                width={60}
                height={60}
                alt="shamrock"
              />
            </span>
            <span className="flex justify-between">
              <span>Celtics Sports Network</span>
              <span className="flex gap-4 ml-8">
                <FontAwesomeIcon icon={faVolleyball} width="32" />
                <FontAwesomeIcon icon={faBasketball} width="32" />
                <FontAwesomeIcon icon={faRunning} width="32" />
                <FontAwesomeIcon icon={faSoccerBall} width="32" />
              </span>
            </span>
          </h1>
        </div>
        <aside className="flex items-end space-y-2 gap-8 font-bold" style={{ color: `var(--dateTime)` }}>
          <div>
            <DateTimeDisplay />
          </div>
          <div>
            <WeatherDisplay />
          </div>
        </aside>
      </header>

      <main className="flex flex-1 h-[77vh]" style={{ background: `var(--background)` }}>
        <aside className="w-[calc(25%+8rem)] p-8">
          <CalendarSection />
        </aside>
        <section className="w-3/4 p-8 flex flex-col gap-16 h-full">
          <FadingGallery key={selectedFolderId || 'root'} selectedFolderId={selectedFolderId} />
        </section>
      </main>
      <footer className="flex p-4 border-emerald-800 z-1">
        <section className="bg-emerald-800 text-white rounded-2xl font-bold w-full overflow-hidden">
          <SportsTickerTeamSnapWrapper />
        </section>
      </footer>
    </div>
  );
}
