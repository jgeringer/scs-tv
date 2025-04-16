// const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1l-oTjaJQxTiNFWCR-RAU7nSvCvNg4Br6G36Je8bmLtU/pub?output=csv';
// const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vRfv4TOxblDhrnqwloIDae8HZsBKeusaw-ApaYqsMHXms06B9kGpZAxNgiCLYXc2G5fATyUMfugbgE4/pub?output=csv`;

// pages/index.js or your component file
"use client";
import React, { useEffect, useState } from 'react';

const SportsTicker: React.FC = () => {
  const [allSheetsData, setAllSheetsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log('SPORTS TICKER!!!');

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/sheets-data'); // Fetch from your API route
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        setAllSheetsData(jsonData);
      } catch (err) {
        setError(err);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>Loading all sheets data...</div>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>Sports Ticker - All Sheets</h2>
      <pre>{JSON.stringify(allSheetsData, null, 2)}</pre>
      {/* You can now access data from different sheets using the keys in allSheetsData */}
      {Object.keys(allSheetsData).map(sheetName => (
        <div key={sheetName}>
          <h3>{sheetName}</h3>
          <ul>
            {allSheetsData[sheetName].map((item, index) => (
              <li key={index}>
                {Object.entries(item).map(([key, value]) => (
                  <p key={key}>
                    <strong>{key}:</strong> {value}
                  </p>
                ))}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default SportsTicker;
