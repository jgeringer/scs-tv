// get events data: https://apiv3.teamsnap.com/events/search?,&is_game=true&token=XXX
// team_id=${uniqueTeamIds}&token=${token}


import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    // get the query parameters of the request
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const divisionLocations = searchParams.get('divisionLocations');
  console.log('😅 divisionLocations ID(s):', divisionLocations);

  try {
    const tokenResponse = await fetch(`https://apiv3.teamsnap.com/division_locations/search?id=${divisionLocations}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    const tokenData = await tokenResponse.json();

    if (tokenResponse.ok) {
      // now make a call to the next API endpoint (get-division-locations)
      console.log('tokenData (divisionLocations):', tokenData)
      return NextResponse.json(tokenData);
    } else {
      console.error('Failed to fetch division location data:', tokenData);
      return NextResponse.json({ error: 'Failed to fetch division location data' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching division location data:', error);
    return NextResponse.json({ error: 'Failed to fetch division location data' }, { status: 500 });
  }
}
