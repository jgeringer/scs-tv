// get division data: https://apiv3.teamsnap.com/teams/division_search?token=XXX
// #access_token=RGrTMC4p-H0TGMy-Rit0Z8gxyHcv0UUp0yIqf6LhQJ4&token_type=Bearer

import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    // get the query parameters of the request
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  try {
    const tokenResponse = await fetch('https://apiv3.teamsnap.com/teams/division_search?division_id=973432&is_active=true', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    const tokenData = await tokenResponse.json();

    if (tokenResponse.ok) {
      // Use the division data as needed
      // return NextResponse.json(tokenData);
      // now make a call to the next API endpoint (get-event)


      return NextResponse.json(tokenData);

    //   // move this to the caller
    //   // loop through and get all team IDs
    //   const teamIds = tokenData.collection.items.map((item: any) => item.data[0].value).join(',');
    //   console.log('Team IDs:', teamIds);
    //   // remove any duplicates
    //   const uniqueTeamIds = Array.from(new Set(teamIds.split(','))).join(',');
    //   console.log('Unique Team IDs:', uniqueTeamIds);

    //   const eventResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/get-events/?team_id=${uniqueTeamIds}&token=${token}`, {
    //     method: 'GET',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${token}`
    //     },
    //   });
    //   const eventData = await eventResponse.json();

    //   if (eventResponse.ok) {
    //     return NextResponse.json(eventData);
    //   } else {
    //     console.error('Failed to fetch event data:', eventData);
    //     return NextResponse.json({ error: 'Failed to fetch event data' }, { status: 400 });
    //   }




    } else {
      console.error('Failed to fetch division data:', tokenData);
      return NextResponse.json({ error: 'Failed to fetch division data' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching division data:', error);
    return NextResponse.json({ error: 'Failed to fetch division data' }, { status: 500 });
  }
}
