import Image from "next/image";
import { formatDate } from "./utils/date";
import { getWeather } from "./utils/weather";
import CalendarSection from "./components/CalendarSection";
import TimeDisplay from "./components/TimeDisplay";
import { getAnnouncements, getPhotoGallery, getSportsTicker } from "./utils/contentful";
import AnnouncementList from "./components/AnnouncementList";
import SportsTicker from "./components/SportsTicker";
import ScoresDisplay from "./components/ScoresDisplay";
import FadingGallery from "./components/FadingGallery";

export default async function Home() {
  const weather = await getWeather();
  const announcements = await getAnnouncements();

  const schoolAnnouncements = announcements.filter(item => item.announcementType === "School") // filter by items where the announcementType is "School"
  const athleticsAnnouncements = announcements.filter(item => item.announcementType === "Athletics") // filter by items where the announcementType is "Athletics"
  const sportsTicker = await getSportsTicker();

  const gallery = await getPhotoGallery();
  console.log('gallery: ', gallery.photoGallery)
  
  return (
    <div className="flex flex-col h-screen">
      <header className="flex justify-between items-center p-4 bg-green-200 h-[100px]">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-green-600 tracking-wide">SCS News</h1>
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
                Hide weather
                {/* <img 
                  src={`http://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                  alt={weather.description}
                  width={50}
                  height={50}
                />
                <span>{weather.temperature}°F - {weather.description}</span> */}
              </div>
            ) : (
              <div>Weather data unavailable</div>
            )}
          </div>
        </aside>
      </header>
      <main className="flex flex-1">
        <aside className="w-1/4 p-4 border-r">
          <h2 className="text-3xl font-bold text-emerald-800 tracking-wide pb-4">Calendar</h2>
          <CalendarSection />
        </aside>
        <section className="w-3/4 p-4 flex flex-col gap-8">
          <div className="h-[25vh] overflow-y-auto">
            <h2 className="text-3xl font-bold text-emerald-800 tracking-wide pb-8">Announcements</h2>
            <AnnouncementList announcements={schoolAnnouncements} type="Carousel" />
          </div>
          <div className="flex gap-6">
            <section className="w-3/5">
              <h2 className="text-3xl font-bold text-emerald-800 tracking-wide mb-4">Celtics Sports Network</h2>
              <AnnouncementList announcements={athleticsAnnouncements} headlineSize="small" />
            </section>
            <aside className="w-2/5">
              <div className="flex flex-col h-full">
                <h2 className="text-3xl font-bold text-emerald-800 tracking-wide mb-4">
                  Shamrock Snapshots
                </h2>
                {gallery.photoGallery && gallery.photoGallery.length > 0 && (
                  <div className="flex-1">
                    <FadingGallery items={gallery.photoGallery} />
                  </div>
                )}
                {/* For each...gallery item */}
                {/* <div className="flex-1 flex items-center justify-center">
                  <img src="" alt="" className="max-w-full max-h-full" />
                  <div className="mt-2 text-center">
                    Caption text here
                  </div>
                </div> */}
              </div>
            </aside>
          </div>
        </section>
      </main>
      <footer className="flex gap-8 p-4 bg-gray-100 border-t-4 border-emerald-800">
        <section className="bg-emerald-800 text-white p-4 rounded font-bold w-full">
          {sportsTicker && <SportsTicker sportsTicker={sportsTicker} />}
        </section>
      </footer>
    </div>
  );
}
