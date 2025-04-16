import { google } from "googleapis";
import { NextResponse } from "next/server"; // Import NextResponse

const SPREADSHEET_ID = "1l-oTjaJQxTiNFWCR-RAU7nSvCvNg4Br6G36Je8bmLtU"; // Replace with your spreadsheet ID
// const SPREADSHEET_ID = `2PACX-1vRfv4TOxblDhrnqwloIDae8HZsBKeusaw-ApaYqsMHXms06B9kGpZAxNgiCLYXc2G5fATyUMfugbgE4`;

export async function GET(req: Request) {
  // Note the change in the 'res' type
  const keyFile = process.env.GOOGLE_CREDENTIALS_JSON;
  try {
    if (!keyFile) {
      throw new Error(
        "GOOGLE_CREDENTIALS_JSON environment variable is not set."
      );
    }
    const credentials = JSON.parse(keyFile);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
    const client = await auth.getClient();

    // @ts-ignore: googleapis-common does not have a type for this
    const sheets = google.sheets({ version: "v4", auth: client });

    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const sheetTitles = (spreadsheetInfo.data.sheets ?? [])
      .map((sheet) => sheet.properties?.title)
      .filter(
        (title): title is string => title !== null && title !== undefined
      );
    const allTabData: { [key: string]: any[] } = {};

    for (const title of sheetTitles) {
      const range = `${title}!A:Z`;
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: range,
      });

      const rows = response.data.values;

      if (rows && rows.length > 0) {
        const headers = rows[0];
        const data = rows.slice(1).map((row) => {
          const obj: { [key: string]: any } = {};
          headers.forEach((header, index) => {
            obj[header] = row[index];
          });
          return obj;
        });
        allTabData[title] = data;
      } else {
        allTabData[title] = [];
      }
    }

    return NextResponse.json(allTabData, { status: 200 }); // Use NextResponse
  } catch (error: any) {
    console.error("Error fetching Google Sheets data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from Google Sheets." },
      { status: 500 } // Use NextResponse
    );
  }
}
