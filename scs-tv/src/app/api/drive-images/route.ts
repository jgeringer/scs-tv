import { google } from 'googleapis';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
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
    
    // Get folderId from query params, default to root folder
    const searchParams = new URL(req.url).searchParams;
    const requestedFolderId = searchParams.get('folderId');
    const folderId = requestedFolderId || '10MCv5ELTHsK9SJfXLmn_VrIPO78GA8UZ'; // This is the root folder ID as seen in the URL
    const rootFolderId = '10MCv5ELTHsK9SJfXLmn_VrIPO78GA8UZ';

    // If a specific folder was requested, validate that it exists
    if (requestedFolderId && requestedFolderId !== rootFolderId) {
      try {
        const folderCheck = await drive.files.get({
          fileId: requestedFolderId,
          fields: 'id, name, mimeType',
        });

        // Verify it's actually a folder
        if (folderCheck.data.mimeType !== 'application/vnd.google-apps.folder') {
          return NextResponse.json(
            { error: 'Selected item is not a folder', folderInvalid: true },
            { status: 400 }
          );
        }
      } catch (err) {
        // Folder doesn't exist or is inaccessible
        console.error('Folder validation error:', err);
        return NextResponse.json(
          { error: 'Selected folder no longer exists or is inaccessible', folderInvalid: true },
          { status: 400 }
        );
      }
    }

    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: 'files(id, name)',
      pageSize: 1000,
      orderBy: 'recency desc', // Example: order by newest first
    });

    const files = (response.data.files || []).filter(file => {
      if (!file.name) return false;
      const name = file.name.toLowerCase();
      return name.endsWith('.jpg') || name.endsWith('.jpeg');
    });

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
