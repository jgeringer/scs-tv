'use client';

import { useEffect, useState } from 'react';

const TEAMSNAP_API_ROOT = 'https://api.teamsnap.com/v3/';

const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob'; // 'YOUR_REDIRECT_URI'; // Should match the server route

const CLIENT_ID = 'Kkm7dwljALFdkxCqRsXu_1ZCqICjr6kNEx7xiEkEIoY'; // Safe to use client ID on client

export default function TeamsnapClient() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use useEffect to handle the OAuth redirect and token exchange
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code && !accessToken) {
      // Exchange code for token on initial load
      async function exchangeCodeForToken() {
        try {
          const response = await fetch('/api/teamsnap-auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
          });
          const data = await response.json();
          if (data.accessToken) {
            setAccessToken(data.accessToken);
          } else {
            setError('Failed to get access token.');
          }
        } catch (err) {
          setError('Error during token exchange.');
        }
      }
      exchangeCodeForToken();
    } else if (accessToken) {
      // Fetch profile data once access token is available
      async function fetchProfile() {
        try {
          const response = await fetch(TEAMSNAP_API_ROOT + 'me', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          });
          if (!response.ok) throw new Error('Failed to fetch profile.');
          const data = await response.json();
          setProfile(data.collection.items[0].data);
        } catch (err) {
          setError('Error fetching profile.');
        }
      }
      fetchProfile();
    }
  }, [accessToken]);

  const startAuthFlow = () => {
    const authUrl = `https://auth.teamsnap.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=read`;
    window.location.href = authUrl;
  };

  if (!accessToken) {
    return (
      <button onClick={startAuthFlow}>Sign in with TeamSnap</button>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>TeamSnap Profile</h1>
      {profile ? (
        <p>Welcome, {profile.find((item: any) => item.name === 'first_name')?.value}!</p>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
}
