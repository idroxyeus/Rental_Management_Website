const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/auth");

// Only landlords/admins can manage expenses
// Middleware to ensure role
const requireLandlord = (req, res, next) => {
  if (req.user.role === "tenant") return res.status(403).json({ message: "Forbidden" });
  next();
};

// Create an expense
router.post("/", verifyToken, requireLandlord, (req, res) => {
  const { property_id, amount, category, description, expense_date } = req.body;
  if (!property_id || !amount || !category || !expense_date) {
    return res.status(400).json({ message: "Property, amount, category, and date are required" });
  }

  db.query(
    "INSERT INTO expenses (property_id, amount, category, description, expense_date) VALUES (?, ?, ?, ?, ?)",
    [property_id, amount, category, description || null, expense_date],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to add expense" });
      res.status(201).json({ expense_id: result.insertId, message: "Expense added successfully" });
    }
  );
});

// Get all expenses
router.get("/", verifyToken, requireLandlord, (req, res) => {
  db.query("SELECT * FROM expenses ORDER BY expense_date DESC", (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch expenses" });
    res.json(results);
  });
});

// Delete an expense
router.delete("/:id", verifyToken, requireLandlord, (req, res) => {
  db.query("DELETE FROM expenses WHERE expense_id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to delete expense" });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Expense not found" });
    res.json({ message: "Expense deleted" });
  });
});

module.exports = router;
