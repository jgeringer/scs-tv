// get events data: https://apiv3.teamsnap.com/events/search?,&is_game=true&token=XXX
// team_id=${uniqueTeamIds}&token=${token}


import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    // get the query parameters of the request
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const teamId = searchParams.get('team_id');
  console.log('😅 Events Team ID(s):', teamId);

  try {
    const tokenResponse = await fetch(`https://apiv3.teamsnap.com/events/search?team_id=${teamId}&is_game=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    const tokenData = await tokenResponse.json();

    if (tokenResponse.ok) {
      // now make a call to the next API endpoint (get-division-locations)
      console.log('tokenData (events):', tokenData)
      return NextResponse.json(tokenData);
    } else {
      console.error('Failed to fetch event data:', tokenData);
      return NextResponse.json({ error: 'Failed to fetch event data' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching event data:', error);
    return NextResponse.json({ error: 'Failed to fetch event data' }, { status: 500 });
  }
}
