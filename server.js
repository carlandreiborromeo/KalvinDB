const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 8080; // Use dynamic port assignment for Azure

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev')); // Logs HTTP requests

// Database configuration (use environment variables for sensitive data)
const config = {
  user: process.env.DB_USER || 'montero',
  password: process.env.DB_PASS || '40Thousand',
  server: process.env.DB_SERVER || 'davilan.database.windows.net',
  database: process.env.DB_NAME || 'bundol',
  options: {
    encrypt: true, // Use encryption
    trustServerCertificate: true, // Ignore SSL certificate validation for simplicity
  },
};

// Initialize connection pool
const pool = new sql.ConnectionPool(config);

// Retry logic for database connection
const connectWithRetry = async (retries = 5) => {
  while (retries > 0) {
    try {
      await pool.connect();
      console.log('Database connected successfully');
      return;
    } catch (err) {
      retries -= 1;
      console.error(`Database connection failed. Retries left: ${retries}.`, err.message);
      if (retries === 0) process.exit(1); // Exit process after exhausting retries
      await new Promise((res) => setTimeout(res, 5000)); // Wait 5 seconds before retrying
    }
  }
};

connectWithRetry();

// Health check endpoint
app.get('/', (req, res) => {
  res.send('App is running and healthy.');
});

// Route to save enrollment data
app.post('/enroll', async (req, res) => {
  const { name, date_of_birth, course, email, phone_number } = req.body;

  try {
    const request = pool.request();
    await request.query(`
      INSERT INTO enrollments (name, date_of_birth, course, email, phone_number)
      VALUES ('${name}', '${date_of_birth}', '${course}', '${email}', '${phone_number}')
    `);

    res.status(201).json({ msg: 'Enrollment data saved successfully' });
  } catch (err) {
    console.error('Error saving enrollment data:', err.message);
    res.status(500).json({ msg: 'Failed to save enrollment data', error: err.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`Error occurred on ${req.method} ${req.url}:`, err.message);
  res.status(500).send('Internal Server Error');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
