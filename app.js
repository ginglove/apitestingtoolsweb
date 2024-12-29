const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();
const flash = require('connect-flash');
const session = require('express-session');

// Middleware setup
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

app.use(flash());

// Pass flash messages to templates
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error');
  next();
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  res.render('index', { result: null });
});

// Information Page Route
app.get('/information', (req, res) => {
    res.render('information'); // Render the information page
  });
// Contacts Page Route

app.get('/contacts', (req, res) => {
    res.render('contacts'); // Render the contacts
});

// API Testing Demo
app.post('/api-test', async (req, res) => {
  const { url, method, payload } = req.body;
  try {
    const response = await axios({
      method,
      url,
      data: payload ? JSON.parse(payload) : undefined,
    });
    res.render('index', { result: JSON.stringify(response.data, null, 2) });
  } catch (error) {
    res.render('index', { result: `Error: ${error.message}` });
  }
});

app.post('/decode-jwt', (req, res) => {
  const { token, algorithm } = req.body;

  try {
      // Decode JWT using the provided algorithm
      const decoded = jwt.verify(token, "your-secret-key", { algorithms: [algorithm] });

      // Render the page with decoded content
      res.render('index', {
          result: JSON.stringify(decoded, null, 2), // Decoded JWT content
          error_msg: '',                           // No error
          token: token || '',                      // Original token value
          algorithm: algorithm || 'HS256'         // Selected algorithm
      });
  } catch (error) {
      // Render the page with the error message and original inputs
      res.render('index', {
          result: '',                              // Clear result
          error_msg: `Error decoding JWT: ${error.message}`, // Error message
          token: token || '',                      // Original token value
          algorithm: algorithm || 'HS256'         // Selected algorithm
      });
  }
});
// Basic Token Decode
app.post('/decode-basic', (req, res) => {
  const { token } = req.body;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    res.render('index', { result: decoded });
  } catch (error) {
    res.render('index', { result: 'Invalid Basic Token!' });
  }
});

// JSON Validation
app.post('/validate-json', (req, res) => {
  const { json } = req.body;
  try {
    const parsed = JSON.parse(json);
    res.render('index', { result: 'Valid JSON: ' + JSON.stringify(parsed, null, 2) });
  } catch (error) {
    res.render('index', { result: 'Invalid JSON!' });
  }
});

// Start the server
const PORT = 3333;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});