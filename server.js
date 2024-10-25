const express = require('express');
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

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
