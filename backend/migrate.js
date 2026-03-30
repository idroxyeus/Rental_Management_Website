const db = require("./db");

const sql = `
CREATE TABLE IF NOT EXISTS expenses (
  expense_id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE
);
`;

db.query(sql, (err) => {
  if (err) {
    console.error("Migration failed:", err);
  } else {
    console.log("Expenses table created successfully");
  }
  process.exit();
});
