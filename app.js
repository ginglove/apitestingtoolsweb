const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const mongoose = require('mongoose');

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

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/ApiTestDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define User Schema and Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
});

const User = mongoose.model('User', userSchema);

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
    apiTestResult:'',
    basicTokenResult: '',
    errorMessage:''
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
// API Testing Route - Test API and Show Results
app.post('/api-test', async (req, res) => {
  const { url, method, payload } = req.body;
  console.log('Received request:', req.body); // Log the full request body
  
  if (!url) {
    // If URL is not provided, render the page with error
    return res.render('index', {
      result: '',
      error_msg: 'Error: URL is required.',
      method,
      payload,
      apiTestResult: '',
      status: 400,
      activeTab: 'api-test',
      validateJsonResult: '',
      basicTokenResult: '',
      token: '',
      header: '',
      algorithm: '',
      signature: '',
      responseStatus: 'danger',
      errorMessage: 'Error: URL is required.'
    });
  }

  try {
    // Ensure full URL is used, add the base URL (e.g., http://localhost:2233)
    const requestBody = payload ? JSON.parse(payload) : {};
    const requestData = {
      method,
      url, // Don't modify the 'url' constant
      data: payload ? JSON.parse(payload) : undefined,
    };

    // Make the API request using axios
    const response = await axios(requestData);

    // Render the result back to the frontend
    res.render('index', {
      method,
      payload,
      apiTestResult: JSON.stringify(response.data, null, 2),
      status: response.status,
      activeTab: 'api-test',
      validateJsonResult: '',
      basicTokenResult: '',
      token: '',
      header: '',
      algorithm: '',
      signature: '',
      responseStatus: 'success',
      errorMessage: ''
    });
  } catch (error) {
    // Handle errors (API request errors or other issues)
    const errorMessage = error.response
      ? `API Error: ${error.response.data.message || error.response.statusText}`
      : `Error: ${error.message}`;

    console.error('Error in /api-test:', errorMessage);

    // Render the error message back to the frontend
    res.render('index', {
      method,
      payload,
      apiTestResult: '',
      status: error.response ? error.response.status : 500,
      activeTab: 'api-test',
      validateJsonResult: '',
      basicTokenResult: '',
      token: '',
      header: '',
      algorithm: '',
      signature: '',
      responseStatus: 'danger',
      errorMessage
    });
  }
});
// app.post('/api-test', async (req, res) => {
//   const { url, method, payload } = req.body;
//   try {
//     const response = await axios({
//       method,
//       url,
//       data: payload ? JSON.parse(payload) : undefined,
//     });
//     res.render('index', 
//       { 
//         apiTestResult: JSON.stringify(response.data, null, 2),
//         validateJsonResult:'',
//         basicTokenResult:'',
//         token:'',
//         algorithm:'',
//         header:'',
//         payload:'',
//         signature:'',
//         activeTab: 'api-test' // Stay on JWT Decode tab 
//       });
//   } catch (error) {
//     res.render('index', 
//       { 
//         apiTestResult: `Error: ${error.message}`,
//         validateJsonResult:'',
//         basicTokenResult:'',
//         token:'',
//         header:'',
//         algorithm:'',
//         payload:'',
//         signature:'',
//         activeTab: 'api-test' // Stay on JWT Decode tab 
//       });
//   }
// });



// Decode jwt
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
        apiTestResult:'',
        errorMessage:'',
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
        apiTestResult:'',
        errorMessage:'',
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
        apiTestResult:'',
        errorMessage:'',        
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
      apiTestResult:'',
      errorMessage:'',      
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
        apiTestResult:'',
        errorMessage:'',        
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
        apiTestResult:'',
        errorMessage:'',        
        activeTab: 'json-validate'
      });
  }
});

// CRUD Operations for Users

// Endpoint to Create User
app.post('/api/users', async (req, res) => {
  const { name, email, age } = req.body;

  if (!name || !email || !age) {
    return res.status(400).json({ message: 'Name, email, and age are required.' });
  }

  try {
    // Create and save the user
    const newUser = new User({ name, email, age });
    const savedUser = await newUser.save();

    // Respond with the created user's details
    res.status(201).json({
      message: 'User created successfully.',
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        age: savedUser.age,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error.message);

    if (error.code === 11000) {
      res.status(400).json({ message: 'Email already exists.' });
    } else {
      res.status(500).json({ message: 'Failed to create user.' });
    }
  }
});

app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Ensure the provided ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Find user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

app.get('/api/users', (req, res) => {
  User.find()  // Using Mongoose to find all users
    .then(users => {
      if (!users || users.length === 0) {
        // Only respond once, make sure no other response is sent before this
        return res.status(404).send({ message: "No users found" });
      }

      // Send the users as a JSON response
      res.status(200).json(users);
    })
    .catch(err => {
      // Handle any errors here and ensure only one response is sent
      console.error('Error fetching users:', err);
      if (!res.headersSent) {
        res.status(500).send({ message: 'Internal Server Error' });
      }
    });
});

// API to update user
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, age } = req.body;

  try {
    // Ensure the provided ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Check if the new email already exists in the database (excluding the current user's email)
    const existingUserWithEmail = await User.findOne({ email, _id: { $ne: id } });

    if (existingUserWithEmail) {
      return res.status(400).json({ message: 'Email already in use by another user' });
    }

    // Proceed with the update
    const updatedUser = await User.findByIdAndUpdate(id, { name, email, age }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// Delete a user by ID
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;

  // Ensure the provided ID is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    // Find and delete the user by ID
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});


// Start the server
const PORT = 4455;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});