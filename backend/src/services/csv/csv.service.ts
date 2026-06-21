import fs from 'fs';
import http from 'http';
import https from 'https';
import csv from 'csv-parser';

export const parseCSVAndExtractSchema = async (filePath: string) => {
  return new Promise<{ headers: string[], types: Record<string, string>, records: any[] }>((resolve, reject) => {
    const results: any[] = [];
    let headers: string[] = [];

    const onEnd = () => {
      // Simple type inference based on the first few rows
      const types: Record<string, string> = {};
      
      headers.forEach((header) => {
        types[header] = 'TEXT'; // Default
        
        for (const row of results.slice(0, 10)) {
          const val = row[header];
          if (val !== undefined && val !== null && val !== '') {
            if (!isNaN(Number(val))) {
              types[header] = val.includes('.') ? 'DOUBLE PRECISION' : 'INTEGER';
            } else if (val.toLowerCase() === 'true' || val.toLowerCase() === 'false') {
              types[header] = 'BOOLEAN';
            } else {
              types[header] = 'TEXT';
              break; // Once it's text, it stays text
            }
          }
        }
      });

      resolve({ headers, types, records: results });
    };

    const processStream = (stream: NodeJS.ReadableStream) => {
      stream.pipe(csv({
          mapHeaders: ({ header }) => header.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_')
        }))
        .on('headers', (h) => headers = h)
        .on('data', (data) => results.push(data))
        .on('end', onEnd)
        .on('error', reject);
    };

    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      const get = filePath.startsWith('https://') ? https.get : http.get;
      get(filePath, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to fetch CSV from URL: ${response.statusCode}`));
          return;
        }
        processStream(response);
      }).on('error', reject);
    } else {
      processStream(fs.createReadStream(filePath));
    }
  });
};
