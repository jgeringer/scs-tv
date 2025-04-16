// @ts-nocheck
import Image from "next/image";
import { formatDate } from "./utils/date";
import { getWeather } from "./utils/weather";
import CalendarSection from "./components/CalendarSection";
import TimeDisplay from "./components/TimeDisplay";
import { getAnnouncements, getPhotoGallery, getSportsTicker } from "./utils/contentful";
import AnnouncementList from "./components/AnnouncementList";
import SportsTicker from "./components/SportsTicker";
import FadingGallery from "./components/FadingGallery";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBasketball, faCamera, faNewspaper, faRunning, faSoccerBall, faVolleyball } from "@fortawesome/free-solid-svg-icons";
import { faPersonRunning } from "@fortawesome/free-solid-svg-icons/faPersonRunning";

// Sheet ID: 1l-oTjaJQxTiNFWCR-RAU7nSvCvNg4Br6G36Je8bmLtU

// https://docs.google.com/spreadsheets/d/e/2PACX-1vRfv4TOxblDhrnqwloIDae8HZsBKeusaw-ApaYqsMHXms06B9kGpZAxNgiCLYXc2G5fATyUMfugbgE4/pub?output=csv

export default async function Home() {
  const weather = await getWeather(); // false;
  const sportsTicker = await getSportsTicker();

  const gallery = await getPhotoGallery();
  
  return (
    <div className="flex flex-col h-screen scs-gradient">
      <header className="flex justify-between items-center p-4 h-[100px] bg-gray-100">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-white tracking-wide flex items-center gap-4 main-text">
            <span>
              <Image src="/shamrock.png" width={60} height={60} alt="shamrock" />
            </span>
            <span className="flex justify-between">
              <span>
                Celtics Sports Network
              </span>
              <span className="flex gap-4 ml-8">
                <FontAwesomeIcon icon={faVolleyball} width="32" />
                <FontAwesomeIcon icon={faBasketball} width="32" />
                <FontAwesomeIcon icon={faRunning} width="32" />
                <FontAwesomeIcon icon={faSoccerBall} width="32" />
              </span>
            </span>
          </h1>
        </div>
        <aside className="flex items-end space-y-2 gap-8 font-bold">
          <div>
            {formatDate()}
          </div>
          <div>
            <TimeDisplay />
          </div>
          <div>
            {weather ? (
              <div className="flex items-center space-x-2">
                <img 
                  src={`http://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                  alt={weather.description}
                  width={50}
                  height={50}
                />
                <span>{weather.temperature}°F - {weather.description}</span>
              </div>
            ) : (
              <div>Weather data unavailable</div>
            )}
          </div>
        </aside>
      </header>
      
      <main className="flex flex-1 bg-gray-200 h-[77vh]">
        <aside className="w-[calc(25%+8rem)] p-8">
          <CalendarSection />
        </aside>
        <section className="w-3/4 p-8 flex flex-col gap-16">
          
          <div className="flex gap-8 h-full floating-gallery">
            
            <aside className="w-full h-full component--dim rounded-2xl p-8 rotate-2">
              <div className="flex flex-col h-full">
                <h2 className="text-3xl font-bold text-white tracking-wide mb-4 eyebrow--dim">
                <FontAwesomeIcon icon={faCamera} width="32" /> Shamrock Snapshots
                </h2>
                {gallery && gallery.photoGallery && gallery.photoGallery.length > 0 && (
                    <div className="flex-1">
                      <FadingGallery items={gallery.photoGallery} />
                    </div>
                  )}
              </div>
            </aside>
          </div>
        </section>
        
  



        {/* <div className="-z-1 absolute left-1/4 top-20 -translate-x-1/2 transform rounded-full border-[500px] border-b-blue-400 border-l-violet-600 border-r-pink-500 border-t-purple-400 blur-[240px]"></div>
        <div className="-z-1 absolute right-[25vw] top-[50vh] rounded-full border-[300px] border-b-cyan-400 border-l-rose-600 border-r-indigo-500 border-t-blue-400 blur-[200px]"></div> */}


      </main>
      <footer className="flex p-4 bg-gray-100 border-emerald-800 z-1">
        <section className="bg-emerald-800 text-white rounded-2xl font-bold w-full overflow-hidden">
          <SportsTicker />
        </section>
      </footer>
    </div>
  );
}
