import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const orgId = searchParams.get('org_id') || '80426'; // Default to TeamSnap One org ID

  try {
    // Try v2 API first (TeamSnap One)
    const v2Response = await fetch(`https://organization-v2-api.teamsnap.com/v2/organizations/${orgId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (v2Response.ok) {
      const v2Data = await v2Response.json();
      console.log('📱 TeamSnap One (v2) organization data:', v2Data);
      return NextResponse.json(v2Data);
    }

    // Fallback to v3 API for classic TeamSnap
    const v3Response = await fetch('https://apiv3.teamsnap.com/divisions/search?organization_id=59004', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    const v3Data = await v3Response.json();

    if (v3Response.ok) {
      console.log('🏀 Classic TeamSnap (v3) organization data');
      return NextResponse.json(v3Data);
    } else {
      console.error('Failed to fetch organization data:', v3Data);
      return NextResponse.json({ error: 'Failed to fetch organization data' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching organization data:', error);
    return NextResponse.json({ error: 'Failed to fetch organization data' }, { status: 500 });
  }
}
