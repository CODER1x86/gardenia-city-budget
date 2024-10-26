const { google } = require('googleapis');
const keys = require('./keys/gardenia-budget-5e41dc658096.json');

const client = new google.auth.JWT(
  keys.client_email,
  null,
  keys.private_key.replace(/\\n/g, '\n'),
  ['https://www.googleapis.com/auth/spreadsheets.readonly']
);

client.authorize(function (err, tokens) {
  if (err) {
    console.log(err);
    return;
  } else {
    console.log('Connected!');
    gsrun(client);
  }
});

async function gsrun(cl) {
  const gsapi = google.sheets({ version: 'v4', auth: cl });

  const opt = {
    spreadsheetId: '1oXgh1ZQJvlcvXsx8Gv-8lVEJEln51UWDCmEsq7f7aj4',
    range: 'Revenue!A1:AS'
  };

  let data = await gsapi.spreadsheets.values.get(opt);
  console.log(data.data);
}
