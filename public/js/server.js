const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');
const app = express();
const axios = require('axios');

// Middleware for parsing request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Serve the index page (API Testing Demo)
app.get('/', (req, res) => {
  res.render('index');
});

// API Testing Route - Test API and Show Results
app.post('/api-test', async (req, res) => {
  const { method, endpoint, payload } = req.body;
  try {
    let response;

    // Handle GET request
    if (method === 'GET') {
      response = await axios.get(endpoint);
    }
    // Handle POST request
    else if (method === 'POST') {
      response = await axios.post(endpoint, JSON.parse(payload));
    }
    // Handle PUT request
    else if (method === 'PUT') {
      response = await axios.put(endpoint, JSON.parse(payload));
    }
    // Handle DELETE request
    else if (method === 'DELETE') {
      response = await axios.delete(endpoint);
    }

    res.render('index', {
      method,
      endpoint,
      payload,
      result: JSON.stringify(response.data, null, 2),
      status: response.status,
      responseStatus: 'success'
    });
  } catch (error) {
    res.render('index', {
      method,
      endpoint,
      payload,
      result: error.message,
      status: error.response ? error.response.status : 500,
      responseStatus: 'danger'
    });
  }
});

// CRUD Operations for Users

// Create a new user
app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  const stmt = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");
  stmt.run(name, email, (err) => {
    if (err) {
      res.status(500).send("Error creating user");
    } else {
      res.status(200).send({ message: "User created successfully" });
    }
  });
});

// Get a user by ID
app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
    if (err || !row) {
      res.status(404).send({ message: "User not found" });
    } else {
      res.status(200).json(row);
    }
  });
});

// Update a user by ID
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  const stmt = db.prepare("UPDATE users SET name = ?, email = ? WHERE id = ?");
  stmt.run(name, email, id, (err) => {
    if (err) {
      res.status(500).send("Error updating user");
    } else {
      res.status(200).send({ message: "User updated successfully" });
    }
  });
});

// Delete a user by ID
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare("DELETE FROM users WHERE id = ?");
  stmt.run(id, (err) => {
    if (err) {
      res.status(500).send("Error deleting user");
    } else {
      res.status(200).send({ message: "User deleted successfully" });
    }
  });
});

// Start the server
const PORT = 2233;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});