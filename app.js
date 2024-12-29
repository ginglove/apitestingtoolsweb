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
  res.render('index', {
    header: '', // Decoded header
    payload: '', // Decoded payload
    signature: '' || 'No signature', // Signature part
    error_msg: '', // No error
    token: '', // Retain token
    algorithm: 'HS256', // Retain algorithm
    activeTab: 'api-test',  // Default active tab,
    validateJsonResult: '',
    basicTokenResult: ''
  });
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
    res.render('index', 
      { 
        apiTestResult: JSON.stringify(response.data, null, 2),
        validateJsonResult:'',
        basicTokenResult:'',
        token:'',
        algorithm:'',
        header:'',
        payload:'',
        signature:'',
        activeTab: 'api-test' // Stay on JWT Decode tab 
      });
  } catch (error) {
    res.render('index', 
      { 
        apiTestResult: `Error: ${error.message}`,
        validateJsonResult:'',
        basicTokenResult:'',
        token:'',
        header:'',
        algorithm:'',
        payload:'',
        signature:'',
        activeTab: 'api-test' // Stay on JWT Decode tab 
      });
  }
});

app.post('/decode-jwt', (req, res) => {
  const { token, algorithm } = req.body;
  let header = '';
  let payload = '';
  let signature = '';
  try {
      const decodedToken = jwt.decode(token, { complete: true });

      // Decode the JWT header for debugging
      if (decodedToken) {
        header = JSON.stringify(decodedToken.header, null, 2);
        payload = JSON.stringify(decodedToken.payload, null, 2);
        signature = token.split('.')[2] || 'No signature available';
    } else {
        throw new Error('Invalid JWT token.');
    }

    if (decodedToken?.header?.alg !== algorithm) {
      throw new Error(`ALGORITHM MISMATCH! ALGORITHM of your Token is: ${decodedToken.header.alg}, Your Selected ALGORITHM is: ${algorithm}`);
    }

      // Verify the token
      jwt.decode(token, { complete: true });

      // Render the result
      res.render('index', {
        header: header, // Decoded header
        payload: payload, // Decoded payload
        signature: signature || 'No signature', // Signature part
        error_msg: '', // No error
        token: token || '', // Retain token
        algorithm: algorithm || 'HS256', // Retain algorithm
        validateJsonResult:'',
        basicTokenResult:'',
        activeTab: 'jwt-decode' // Stay on JWT Decode tab
      });
  } catch (error) {
      // Handle errors gracefully
      res.render('index', {
        header: '', // Clear header
        payload: '', // Clear payload
        signature: '', // Clear signature
        error_msg: `Error decoding JWT: ${error.message}`, // Error message
        token: token || '', // Retain token
        algorithm: algorithm || 'HS256', // Retain algorithm
        validateJsonResult:'',
        basicTokenResult:'',
        activeTab: 'jwt-decode' // Stay on JWT Decode tab
      });
  }
});
// Basic Token Decode
app.post('/decode-basic', (req, res) => {
  const { token } = req.body;
  let decodeStatus = 'danger';
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    decodeStatus = 'success';
    res.render('index', 
      { 
        basicTokenResult: decoded, 
        token:'',
        algorithm:'',
        header:'',
        payload:'',
        signature:'',
        decodeStatus,
        validateJsonResult:'',
        activeTab: 'basic-decode'
      });
  } catch (error) {
    decodeStatus = 'danger';
    res.render('index', { 
      basicTokenResult: 'Invalid Basic Token!',
      token:'',
      algorithm:'',
      header:'',
      payload:'',
      signature:'',
      decodeStatus,
      validateJsonResult:'',
      activeTab: 'basic-decode' 
    });
  }
});

// JSON Validation
app.post('/validate-json', (req, res) => {
  const { json } = req.body;
  let validationStatus = 'danger'; // Default to invalid
  try {
    const parsed = JSON.parse(json);
    validationStatus = 'success'; // Valid JSON
    res.render('index', 
      { 
        validateJsonResult: JSON.stringify(parsed, null, 2),
        token:'',
        algorithm:'',
        header:'',
        payload:'',
        signature:'',
        validationStatus,
        basicTokenResult:'',
        activeTab: 'json-validate'
      });
  } catch (error) {
    validationStatus = 'danger'; // Invalid JSON
    res.render('index', 
      { 
        validateJsonResult: 'Invalid JSON!',
        token: '',
        algorithm:'',
        header:'',
        payload:'',
        signature:'',
        validationStatus,
        basicTokenResult:'',
        activeTab: 'json-validate'
      });
  }
});

// Start the server
const PORT = 4455;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});