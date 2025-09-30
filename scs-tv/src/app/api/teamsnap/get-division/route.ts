// get division data: https://apiv3.teamsnap.com/teams/division_search?token=XXX
// #access_token=RGrTMC4p-H0TGMy-Rit0Z8gxyHcv0UUp0yIqf6LhQJ4&token_type=Bearer

import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    // get the query parameters of the request
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const division_ids = searchParams.get('division_ids');

  try {
    // const tokenResponse = await fetch(`https://apiv3.teamsnap.com/teams/division_search?division_id=907610,973432&is_active=true`, { // Why does 907610,911665,913956,913959,913970,973432,973585,1006476,1025375 show basketball, but 973432 shows only soccer?
    const tokenResponse = await fetch(`https://apiv3.teamsnap.com/teams/division_search?division_id=${division_ids}&is_active=true`, {
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


    } else {
      console.error('Failed to fetch division data:', tokenData);
      return NextResponse.json({ error: 'Failed to fetch division data' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching division data:', error);
    return NextResponse.json({ error: 'Failed to fetch division data' }, { status: 500 });
  }
}



// get division data: https://apiv3.teamsnap.com/teams/division_search?token=XXX
// #access_token=RGrTMC4p-H0TGMy-Rit0Z8gxyHcv0UUp0yIqf6LhQJ4&token_type=Bearer

// import { NextResponse } from 'next/server';

// export async function GET(req: Request) {
//     // get the query parameters of the request
//   const { searchParams } = new URL(req.url);
//   const token = searchParams.get('token');
//   const division_ids = searchParams.get('division_ids');

//   try {
//     // Split division_ids into array
//     const divisionIdArr = division_ids ? division_ids.split(',') : [];
//     const results = [];
//     for (const divisionId of divisionIdArr) {
//       const resp = await fetch(`https://apiv3.teamsnap.com/teams/division_search?division_id=${divisionId}&is_active=true`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//       });
//       const data = await resp.json();
//       if (resp.ok) {
//         results.push(data);
//       } else {
//         console.error(`Failed to fetch division data for ${divisionId}:`, data);
//       }
//     }
//     // Combine all results into a single response
//     return NextResponse.json(results);
//     // return NextResponse.json({ divisions: results });
//   } catch (error) {
//     console.error('Error fetching division data:', error);
//     return NextResponse.json({ error: 'Failed to fetch division data' }, { status: 500 });
//   }
// }
