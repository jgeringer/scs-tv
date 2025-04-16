"use client";
import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';


// const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1l-oTjaJQxTiNFWCR-RAU7nSvCvNg4Br6G36Je8bmLtU/pub?output=csv';
const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vRfv4TOxblDhrnqwloIDae8HZsBKeusaw-ApaYqsMHXms06B9kGpZAxNgiCLYXc2G5fATyUMfugbgE4/pub?output=csv`;

const SportsTicker: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(SHEET_CSV_URL)
      .then((response) => response.text())
      .then((csvText) => {
        console.log('----- csvText: ', csvText)
        const parsed = Papa.parse(csvText, { header: true });
        setData(parsed.data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Sports Ticker</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      {/* You can map over data here to create your ticker UI */}
    </div>
  );
};

export default SportsTicker;
