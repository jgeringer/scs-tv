import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeSwitcher from "./components/ThemeSwitcher";
import TeamsnapClient from "./components/TeamsnapClient";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SCS TV",
  description: "SCS TV Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=National+Park:wght@400;700&display=swap+Great+Vibes&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet" />
        <script type="text/javascript" src="teamsnap.js"></script>
        {/* <script dangerouslySetInnerHTML={{
          __html: `
            // https://github.com/teamsnap/teamsnap-javascript-sdk/wiki/Quick-Start
            teamsnap.init("Kkm7dwljALFdkxCqRsXu_1ZCqICjr6kNEx7xiEkEIoY");

    //         // new
            try {
      const response = await fetch('https://api.teamsnap.com/v3/me', {
        method: 'GET',
        headers: {
          'Authorization': "Bearer Vy6AWQblRlDd944QG5fGaFaO4XRSEXcAteecxoEsGg0",
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const data = await response.json();
      console.log('My Profile:', data);

    } catch (error) {
      console.error(error);
    }
            // new end

            if (teamsnap.hasSession()) {
              teamsnap.auth();
              teamsnap.loadCollections(function(err) {
                if (err) {
                  alert('Error loading TeamSnap SDK');
                  return;
                }
                teamsnap.loadTeams(onTeamsLoad);
              });
            } else {
              // auth
              var redirect = 'urn:ietf:wg:oauth:2.0:oob'; // One of the redirect URLs entered when creating your application, must be same-domain. TODO: This is local. Make it go off of env.
              var scopes = ['read'];
              console.log('authing...');

              teamsnap.startBrowserAuth(redirect, scopes, function(err) {
                console.log('auth');
                if (err) {
                  alert('Error loading TeamSnap SDK');
                  return;
                }
                console.log('not error...');
                teamsnap.loadCollections(function(err) {
                  console.log('😍 after auth, load collections');
                  teamsnap.loadTeams(onTeamsLoad);
                });
              });
            }

          `
        }} /> */}
      </head>
      <body className={`${inter.className} font-national-park border-emerald-800`}>
        <ThemeSwitcher />
        <TeamsnapClient />
        {children}
      </body>
    </html>
  );
}
