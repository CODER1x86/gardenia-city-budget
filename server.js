const express = require('express');
const { google } = require('googleapis');
const keys = require('./keys/gardenia-budget-5e41dc658096.json'); // Path to your service account key file

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Basic route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Dynamic routes for other pages
app.get('/:page', (req, res) => {
  const page = req.params.page;
  if (page.endsWith('.html')) {
    res.sendFile(__dirname + `/public/${page}`);
  } else {
    res.sendFile(__dirname + `/public/${page}.html`);
  }
});

const client = new google.auth.JWT(
  keys.client_email,
  null,
  keys.private_key.replace(/\\n/g, '\n'), // Fix for escaped new lines in private_key
  ['https://www.googleapis.com/auth/spreadsheets.readonly']
);

app.get('/sheets/data', async (req, res) => {
  try {
    await client.authorize();
    const sheets = google.sheets({ version: 'v4', auth: client });

    // Get data from Revenue sheet
    const responseRevenue = await sheets.spreadsheets.values.get({
      spreadsheetId: '1oXgh1ZQJvlcvXsx8Gv-8lVEJEln51UWDCmEsq7f7aj4', // Your spreadsheet ID
      range: 'Revenue!A1:AS'
    });

    // Get data from Expenses sheet
    const responseExpenses = await sheets.spreadsheets.values.get({
      spreadsheetId: '1oXgh1ZQJvlcvXsx8Gv-8lVEJEln51UWDCmEsq7f7aj4', // Your spreadsheet ID
      range: 'Expenses!A1:E'
    });

    const data = {
      revenue: responseRevenue.data,
      expenses: responseExpenses.data
    };

    res.json(data);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
