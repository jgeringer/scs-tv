import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET() {
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
    const folderId = '10MCv5ELTHsK9SJfXLmn_VrIPO78GA8UZ';

    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: 'files(id, name)',
    });

    const files = response.data.files || [];

    const imageUrls = await Promise.all(files.map(async (file) => {
      const fileResponse = await drive.files.get({
        fileId: file.id,
        fields: 'webContentLink',
      });

      return {
        name: file.name,
        id: file.id,
        url: fileResponse.data.webContentLink,
      };
    }));

    return NextResponse.json(imageUrls);
  } catch (err) {
    console.error('Drive API error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch images from Drive' },
      { status: 500 }
    );
  }
}
