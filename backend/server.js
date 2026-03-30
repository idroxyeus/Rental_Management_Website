const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/", require("./routes/auth"));
app.use("/properties", require("./routes/properties"));
app.use("/tenants", require("./routes/tenants"));
app.use("/landlords", require("./routes/landlords"));
app.use("/leases", require("./routes/leases"));
app.use("/payments", require("./routes/payments"));
app.use("/complaints", require("./routes/complaints"));
app.use("/expenses", require("./routes/expenses"));

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});