const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/auth");

// Create payment
router.post("/", verifyToken, (req, res) => {
  const { lease_id, amount, payment_date, month, status } = req.body;

  if (!lease_id || !amount || !payment_date) {
    return res.status(400).json({ message: "Lease ID, amount and payment date are required" });
  }

  db.query(
    "INSERT INTO payments (lease_id, amount, payment_date, month, status) VALUES (?, ?, ?, ?, ?)",
    [lease_id, amount, payment_date, month, status || "paid"],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to create payment" });
      res.status(201).json({ payment_id: result.insertId, message: "Payment recorded" });
    }
  );
});

// Get all payments
router.get("/", verifyToken, (req, res) => {
  if (req.user.role === "tenant") {
    db.query("SELECT tenant_id FROM tenants WHERE user_id = ?", [req.user.id], (err, tenants) => {
      if (err || !tenants.length) return res.json([]);
      db.query(`SELECT p.* FROM payments p 
                JOIN leases l ON p.lease_id = l.lease_id 
                WHERE l.tenant_id = ? ORDER BY p.payment_id DESC`, [tenants[0].tenant_id], (err, results) => {
        if (err) return res.status(500).json({ message: "Failed to fetch payments" });
        res.json(results);
      });
    });
  } else {
    db.query("SELECT * FROM payments ORDER BY payment_id DESC", (err, results) => {
      if (err) return res.status(500).json({ message: "Failed to fetch payments" });
      res.json(results);
    });
  }
});

// Update payment
router.put("/:id", verifyToken, (req, res) => {
  const { amount, payment_date, month, status } = req.body;

  db.query(
    "UPDATE payments SET amount = ?, payment_date = ?, month = ?, status = ? WHERE payment_id = ?",
    [amount, payment_date, month, status, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to update payment" });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Payment not found" });
      res.json({ message: "Payment updated" });
    }
  );
});

// Delete payment
router.delete("/:id", verifyToken, (req, res) => {
  db.query("DELETE FROM payments WHERE payment_id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to delete payment" });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Payment not found" });
    res.json({ message: "Payment deleted" });
  });
});

module.exports = router;
