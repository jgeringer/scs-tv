import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const programSeasonId = searchParams.get('program_season_id');

  if (!token || !programSeasonId) {
    return NextResponse.json({ error: 'Missing token or program_season_id' }, { status: 400 });
  }

  try {
    const scheduleResponse = await fetch(
      `https://organization-v2-api.teamsnap.com/v2/program-seasons/${programSeasonId}/schedule/search`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!scheduleResponse.ok) {
      console.error('Failed to fetch schedule:', scheduleResponse.status);
      return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: scheduleResponse.status });
    }

    const scheduleData = await scheduleResponse.json();

    return NextResponse.json(scheduleData);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 });
  }
}
