import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const keyFile = process.env.GOOGLE_CREDENTIALS_JSON;
    if (!keyFile) {
      throw new Error('Google credentials not found');
    }

    const credentials = JSON.parse(keyFile);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });
    const rootFolderId = '10MCv5ELTHsK9SJfXLmn_VrIPO78GA8UZ'; // Root folder ID

    const response = await drive.files.list({
      q: `'${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
      pageSize: 1000,
      orderBy: 'name asc',
    });

    const folders = response.data.files || [];
    return NextResponse.json(folders);
  } catch (err) {
    console.error('Drive API error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch folders from Drive' },
      { status: 500 }
    );
  }
}
