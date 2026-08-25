import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const orgId = searchParams.get('org_id') || '80426';

  try {
    // Fetch programs from TeamSnap One v2 API
    const programsResponse = await fetch(`https://organization-v2-api.teamsnap.com/v2/organizations/${orgId}/programs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!programsResponse.ok) {
      console.error('Failed to fetch programs:', programsResponse.status);
      return NextResponse.json({ error: 'Failed to fetch programs' }, { status: programsResponse.status });
    }

    const programsData = await programsResponse.json();
    console.log('📱 Programs data fetched');

    return NextResponse.json(programsData);
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json({ error: 'Failed to fetch programs' }, { status: 500 });
  }
}
