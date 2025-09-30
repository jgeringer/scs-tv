import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    // get the query parameters of the request
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  try {
    const tokenResponse = await fetch('https://apiv3.teamsnap.com/divisions/search?organization_id=59004', { // TODO: WTF is the division ID here?
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    const tokenData = await tokenResponse.json();

    if (tokenResponse.ok) {


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
