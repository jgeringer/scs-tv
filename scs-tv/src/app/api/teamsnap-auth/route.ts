import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { code } = await request.json();
  const clientId = process.env.TEAMSNA_CLIENT_ID;
  const clientSecret = process.env.TEAMSNA_CLIENT_SECRET;
  const redirectUri = 'YOUR_REDIRECT_URI'; // Must match the URI registered with TeamSnap

  try {
    const tokenResponse = await fetch('https://auth.teamsnap.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: clientId as string,
        client_secret: clientSecret as string,
        redirect_uri: redirectUri
      })
    });
    const tokenData = await tokenResponse.json();

    if (tokenResponse.ok) {
      // Return the access token to the client.
      // NOTE: Consider using Next.js cookies or server-side state management for better security.
      return NextResponse.json({ accessToken: tokenData.access_token });
    } else {
      console.error('Failed to exchange token:', tokenData);
      return NextResponse.json({ error: 'Failed to exchange token' }, { status: 400 });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
