const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/auth");

// Create property
router.post("/", verifyToken, (req, res) => {
  const { address, property_type, rent_amount, status } = req.body;

  if (!address || !property_type || !rent_amount) {
    return res.status(400).json({ message: "Address, type and rent amount are required" });
  }

  db.query(
    "INSERT INTO properties (address, property_type, rent_amount, status) VALUES (?, ?, ?, ?)",
    [address, property_type, rent_amount, status || "vacant"],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to create property" });
      res.status(201).json({ property_id: result.insertId, message: "Property created" });
    }
  );
});

// Get all properties
router.get("/", verifyToken, (req, res) => {
  if (req.user.role === "tenant") {
    db.query("SELECT * FROM properties WHERE status = 'vacant' ORDER BY property_id DESC", (err, results) => {
      if (err) return res.status(500).json({ message: "Failed to fetch properties" });
      res.json(results);
    });
  } else {
    db.query("SELECT * FROM properties ORDER BY property_id DESC", (err, results) => {
      if (err) return res.status(500).json({ message: "Failed to fetch properties" });
      res.json(results);
    });
  }
});

// Get single property
router.get("/:id", verifyToken, (req, res) => {
  db.query("SELECT * FROM properties WHERE property_id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch property" });
    if (!results.length) return res.status(404).json({ message: "Property not found" });
    res.json(results[0]);
  });
});

// Update property
router.put("/:id", verifyToken, (req, res) => {
  const { address, property_type, rent_amount, status } = req.body;

  db.query(
    "UPDATE properties SET address = ?, property_type = ?, rent_amount = ?, status = ? WHERE property_id = ?",
    [address, property_type, rent_amount, status, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to update property" });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Property not found" });
      res.json({ message: "Property updated" });
    }
  );
});

// Delete property
router.delete("/:id", verifyToken, (req, res) => {
  db.query("DELETE FROM properties WHERE property_id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to delete property" });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Property not found" });
    res.json({ message: "Property deleted" });
  });
});

module.exports = router;
