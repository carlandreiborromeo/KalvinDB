const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8080; // Use dynamic port assignment for Azure

app.use(bodyParser.json());
app.use(cors());

// Database configuration (use your Azure SQL connection string here)
const config = {
  user: 'montero',
  password: '40Thousand',
  server: 'davilan.database.windows.net',
  database: 'bundol',
  options: {
    encrypt: true, // Use encryption
    trustServerCertificate: true, // Ignore SSL certificate validation for simplicity
  },
};

// Test database connection
sql.connect(config)
  .then(() => console.log('Database connected successfully'))
  .catch((err) => {
    console.error('Error connecting to database:', err.message);
    process.exit(1); // Exit the process if the database connection fails
  });

// Health check endpoint
app.get('/', (req, res) => {
  res.send('App is running and healthy.');
});

// Route to save enrollment data
app.post('/enroll', async (req, res) => {
  const { name, date_of_birth, course, email, phone_number } = req.body;

  try {
    await sql.connect(config);
    await sql.query
      INSERT INTO enrollments (name, date_of_birth, course, email, phone_number)
      VALUES (${name}, ${date_of_birth}, ${course}, ${email}, ${phone_number})
    ;

    res.status(201).json({ msg: 'Enrollment data saved successfully' });
  } catch (err) {
    console.error('Error saving enrollment data:', err.message);
    res.status(500).json({ msg: 'Failed to save enrollment data' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(Server is running on port ${port});
});

