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

// Auto-generate missing payments for the current month
router.post("/generate", verifyToken, (req, res) => {
  if (req.user.role === "tenant") return res.status(403).json({ message: "Not authorized" });
  
  const currentMonth = new Date().toISOString().substring(0, 7); // "YYYY-MM"
  
  db.query("SELECT * FROM leases WHERE status = 'active'", (err, leases) => {
    if (err) return res.status(500).json({ message: "Failed to fetch leases" });
    if (!leases.length) return res.json({ message: "No active leases to bill" });
    
    // Check existing payments for this month
    db.query("SELECT lease_id FROM payments WHERE month = ?", [currentMonth], (err, existing) => {
      if (err) return res.status(500).json({ message: "Failed to fetch pending payments" });
      
      const existingLeaseIds = new Set(existing.map(p => p.lease_id));
      const newPayments = leases.filter(l => !existingLeaseIds.has(l.lease_id));
      
      if (!newPayments.length) return res.json({ message: "All bills generated for this month" });
      
      const values = newPayments.map(l => [
        l.lease_id, l.rent_amount, new Date().toISOString().split("T")[0], currentMonth, "pending"
      ]);
      
      db.query(
        "INSERT INTO payments (lease_id, amount, payment_date, month, status) VALUES ?",
        [values],
        (err, result) => {
          if (err) return res.status(500).json({ message: "Failed to generate bills" });
          res.status(201).json({ message: `Generated ${result.affectedRows} pending bills.` });
        }
      );
    });
  });
});

module.exports = router;
