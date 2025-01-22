const express = require("express");
const cors = require("cors");
const sql = require("mssql");

const app = express();
const port = process.env.PORT || 8080; // Use the PORT environment variable if set, otherwise default to 8080

// Azure SQL connection configuration
const dbConfig = {
  user: "montero", // Azure SQL username
  password: "40Thousand", // Azure SQL password
  server: "davilan.database.windows.net", // Azure SQL server name
  database: "bundol", // Your database name
  options: {
    encrypt: true, // Use encryption
    trustServerCertificate: true, // Bypass SSL certificate validation
  },
};

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.send("App is running and healthy.");
});

// Route to get all enrollment records
app.get("/enrollment", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig); // Connect to Azure SQL
    const result = await pool
      .request()
      .query("SELECT * FROM enrollment ORDER BY id DESC");
    res.json(result.recordset); // Return the query results
  } catch (err) {
    console.error("Error querying the database:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Route to create a new enrollment record
app.post("/enrollment", async (req, res) => {
  const { name, date_of_birth, course, email, phone_number } = req.body;

  try {
    const pool = await sql.connect(dbConfig); // Connect to Azure SQL
    const result = await pool
      .request()
      .input("name", sql.NVarChar, name)
      .input("date_of_birth", sql.Date, date_of_birth)
      .input("course", sql.NVarChar, course)
      .input("email", sql.NVarChar, email)
      .input("phone_number", sql.NVarChar, phone_number)
      .query(
        "INSERT INTO enrollment (name, date_of_birth, course, email, phone_number) VALUES (@name, @date_of_birth, @course, @email, @phone_number)"
      );

    res.status(201).json({
      message: "Enrollment created successfully",
      data: { name, date_of_birth, course, email, phone_number },
    });
  } catch (err) {
    console.error("Error inserting into the database:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

