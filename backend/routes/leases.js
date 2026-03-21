const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/auth");

// Create lease
router.post("/", verifyToken, (req, res) => {
  const { property_id, tenant_id, start_date, end_date, rent_amount, deposit, status } = req.body;

  if (!property_id || !tenant_id || !start_date || !end_date || !rent_amount) {
    return res.status(400).json({ message: "Property, tenant, dates, and rent amount are required" });
  }

  db.query(
    "INSERT INTO leases (property_id, tenant_id, start_date, end_date, rent_amount, deposit, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [property_id, tenant_id, start_date, end_date, rent_amount, deposit || 0, status || "active"],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to create lease" });
      
      // Also update the property status to 'occupied'
      db.query("UPDATE properties SET status = 'occupied' WHERE property_id = ?", [property_id]);
      
      res.status(201).json({ lease_id: result.insertId, message: "Lease created" });
    }
  );
});

// Get all leases (with tenant filtering logic)
router.get("/", verifyToken, (req, res) => {
  // If the user is a tenant, they should only see their own leases!
  if (req.user.role === "tenant") {
    // First find the tenant_id for this user
    db.query("SELECT tenant_id FROM tenants WHERE user_id = ?", [req.user.id], (err, tenants) => {
      if (err || !tenants.length) return res.json([]);
      const tenantId = tenants[0].tenant_id;
      db.query("SELECT * FROM leases WHERE tenant_id = ? ORDER BY lease_id DESC", [tenantId], (err, results) => {
        if (err) return res.status(500).json({ message: "Failed to fetch leases" });
        res.json(results);
      });
    });
  } else {
    // Admins and Landlords see all leases
    db.query("SELECT * FROM leases ORDER BY lease_id DESC", (err, results) => {
      if (err) return res.status(500).json({ message: "Failed to fetch leases" });
      res.json(results);
    });
  }
});

// Update lease
router.put("/:id", verifyToken, (req, res) => {
  const { start_date, end_date, rent_amount, deposit, status } = req.body;

  db.query(
    "UPDATE leases SET start_date = ?, end_date = ?, rent_amount = ?, deposit = ?, status = ? WHERE lease_id = ?",
    [start_date, end_date, rent_amount, deposit, status, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to update lease" });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Lease not found" });
      res.json({ message: "Lease updated" });
    }
  );
});

// Delete lease
router.delete("/:id", verifyToken, (req, res) => {
  db.query("DELETE FROM leases WHERE lease_id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to delete lease" });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Lease not found" });
    res.json({ message: "Lease deleted" });
  });
});

module.exports = router;
