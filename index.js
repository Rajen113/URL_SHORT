const express = require('express');
const crypto = require('crypto');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;


// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for parsing URL-encoded bodies (for forms)
app.use(express.urlencoded({ extended: true }));

// A simple in-memory store for the URLs
const urlDatabase = {};

// Function to generate a short URL
function generateShortUrl(longUrl) {
  // Create a hash of the long URL
  const hash = crypto.createHash('sha256').update(longUrl).digest('hex');
  // Take the first 6 characters as the short URL
  const shortUrl = hash.substring(0, 6);
  return shortUrl;
}

// Endpoint to display the form to shorten URLs
app.get('/', (req, res) => {
  res.render('index', { shortUrl: null, error: null });
});

// Endpoint to handle the form submission and shorten a URL
app.post('/shorten', (req, res) => {
  const { longUrl } = req.body;

  if (!longUrl) {
    return res.render('index', { shortUrl: null, error: 'URL is required' });
  }

  // Generate a short URL
  const shortUrl = generateShortUrl(longUrl);

  // Store the mapping of short URL to long URL
  urlDatabase[shortUrl] = longUrl;

  return res.render('index', { shortUrl: `http://localhost:${port}/${shortUrl}`, error: null });
});

// Endpoint to redirect to the original URL
app.get('/:shortUrl', (req, res) => {
  const { shortUrl } = req.params;

  // Look up the long URL from the database
  const longUrl = urlDatabase[shortUrl];

  if (!longUrl) {
    return res.status(404).render('index', { shortUrl: null, error: 'Short URL not found' });
  }

  // Redirect to the long URL
  return res.redirect(longUrl);
});

app.listen(port, () => {
  console.log(`URL shortener service running at http://localhost:${port}`);
});
