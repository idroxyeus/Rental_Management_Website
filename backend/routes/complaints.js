const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/auth");

// Create complaint
router.post("/", verifyToken, (req, res) => {
  const { tenant_id, property_id, description, status } = req.body;

  if (!tenant_id || !property_id || !description) {
    return res.status(400).json({ message: "Tenant, property and description are required" });
  }

  db.query(
    "INSERT INTO complaints (tenant_id, property_id, description, status) VALUES (?, ?, ?, ?)",
    [tenant_id, property_id, description, status || "open"],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to create complaint" });
      res.status(201).json({ complaint_id: result.insertId, message: "Complaint filed" });
    }
  );
});

// Get all complaints
router.get("/", verifyToken, (req, res) => {
  if (req.user.role === "tenant") {
    db.query("SELECT tenant_id FROM tenants WHERE user_id = ?", [req.user.id], (err, tenants) => {
      if (err || !tenants.length) return res.json([]);
      db.query("SELECT * FROM complaints WHERE tenant_id = ? ORDER BY complaint_id DESC", [tenants[0].tenant_id], (err, results) => {
        if (err) return res.status(500).json({ message: "Failed to fetch complaints" });
        res.json(results);
      });
    });
  } else {
    db.query("SELECT * FROM complaints ORDER BY complaint_id DESC", (err, results) => {
      if (err) return res.status(500).json({ message: "Failed to fetch complaints" });
      res.json(results);
    });
  }
});

// Update complaint
router.put("/:id", verifyToken, (req, res) => {
  const { description, status } = req.body;

  db.query(
    "UPDATE complaints SET description = ?, status = ? WHERE complaint_id = ?",
    [description, status, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to update complaint" });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Complaint not found" });
      res.json({ message: "Complaint updated" });
    }
  );
});

// Delete complaint
router.delete("/:id", verifyToken, (req, res) => {
  db.query("DELETE FROM complaints WHERE complaint_id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to delete complaint" });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Complaint not found" });
    res.json({ message: "Complaint deleted" });
  });
});

module.exports = router;
