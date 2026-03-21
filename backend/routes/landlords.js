const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/auth");

// Create landlord
router.post("/", verifyToken, (req, res) => {
  const { user_id, full_name, phone_number, email, address, id_proof } = req.body;

  if (!user_id || !full_name || !phone_number) {
    return res.status(400).json({ message: "User ID, full name, and phone number are required" });
  }

  db.query(
    `INSERT INTO landlords (user_id, full_name, phone_number, email, address, id_proof) VALUES (?, ?, ?, ?, ?, ?)`,
    [user_id, full_name, phone_number, email || null, address || null, id_proof || null],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to create landlord", error: err.message });
      res.status(201).json({ landlord_id: result.insertId, message: "Landlord created" });
    }
  );
});

// Get landlord by user_id
router.get("/user/:userId", verifyToken, (req, res) => {
  db.query("SELECT * FROM landlords WHERE user_id = ?", [req.params.userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch landlord" });
    if (!results.length) return res.status(404).json({ message: "Landlord not found" });
    res.json(results[0]);
  });
});

// Update landlord
router.put("/:id", verifyToken, (req, res) => {
  const { full_name, phone_number, email, address, id_proof } = req.body;

  db.query(
    `UPDATE landlords SET full_name=?, phone_number=?, email=?, address=?, id_proof=? WHERE landlord_id=?`,
    [full_name, phone_number, email || null, address || null, id_proof || null, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to update landlord", error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Landlord not found" });
      res.json({ message: "Landlord updated" });
    }
  );
});

module.exports = router;
