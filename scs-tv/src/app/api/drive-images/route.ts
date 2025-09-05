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

    // The orderBy parameter supports the following fields:
    // - createdTime
    // - folder
    // - modifiedByMeTime
    // - modifiedTime
    // - name
    // - quotaBytesUsed
    // - recency
    // - sharedWithMeTime
    // - starred
    // - viewedByMeTime

    // You can use 'asc' or 'desc' for ascending or descending order, e.g. 'name desc'
    // Multiple fields can be separated by commas, e.g. 'folder, name desc'

    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: 'files(id, name)',
      pageSize: 1000,
      orderBy: 'recency desc', // Example: order by newest first
    });

    const files = response.data.files || [];

    const imageUrls = await Promise.all(files.map(async (file) => {
      if (!file.id) {
        return {
          name: file.name || 'Unknown',
          id: 'unknown',
          url: '',
        };
      }
      
      const directUrl = `https://drive.usercontent.google.com/download?&id=${file.id}&export=view`;

      return {
        name: file.name,
        id: file.id,
        url: directUrl,
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
