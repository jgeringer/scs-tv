import Image from "next/image";
import { formatDate } from "./utils/date";
import { formatTime } from "./utils/time";
import { getWeather } from "./utils/weather";
import CalendarSection from "./components/CalendarSection";

export default async function Home() {
  const weather = await getWeather();
  
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
            {formatTime()}
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
      <main className="flex flex-1">
        <aside className="w-1/4 p-4 border-r">
          <h2 className="text-3xl font-bold text-green-600 tracking-wide">Calendar</h2>
          {/* <CalendarSection /> */}
        </aside>
        <section className="w-3/4 p-4 flex flex-col gap-8">
          <div className="h-[30vh] overflow-y-auto">
            <h2 className="text-3xl font-bold text-green-600 tracking-wide">Announcements</h2>
            <ol>
              <li>
                <h3 className="text-4xl font-bold text-green-600 tracking-wide">Out of uniform day tomorrow!</h3>
                <p>No need to wear an uniform on Friday, April 10th.</p>
                <img src="" alt="" />
              </li>
              <li>
                <h3 className="text-4xl font-bold text-green-600 tracking-wide">Out of uniform day tomorrow too!</h3>
                <p>You get an out of uniform pass, you get an out of uniform pass!</p>
                <img src="" alt="" />
              </li>
            </ol>
          </div>
          <div className="flex gap-6">
            <section className="w-3/5">
              <h2 className="text-3xl font-bold text-green-600 tracking-wide">Celtics Sports Network</h2>
              <ol>
                <li>
                  <div>
                    <h4 className="text-sm font-bold text-green-600 tracking-wide font-bold uppercase">Track & Field</h4>
                    <h3>Devin destroys the competition… yet again</h3>
                    <p>Coming in first place in all four events he played in.</p>
                  </div>
                  <div>
                    <img src="" alt="" />
                  </div>
                </li>
              </ol>
            </section>
            <aside className="w-2/5 p-4">
              <div className="flex flex-col h-full">
                <h2 className="text-3xl font-bold text-green-600 tracking-wide">
                  Photo Gallery</h2>
                <div className="flex-1 flex items-center justify-center">
                  <img src="" alt="" className="max-w-full max-h-full" />
                  <div className="mt-2 text-center">
                    Caption text here
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <footer className="flex gap-8 p-4 bg-gray-100 border-t-4 border-emerald-800">
        <section className="w-1/4 bg-emerald-800 text-white p-4 rounded font-bold">
            Volleyball
          </section>
        <aside className="w-3/4 p-4">
          Scores
        </aside>
      </footer>
    </div>
  );
}
