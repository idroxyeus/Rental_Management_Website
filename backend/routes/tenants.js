const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/auth");

// Create tenant
router.post("/", verifyToken, (req, res) => {
  const {
    user_id, full_name, date_of_birth, gender, phone_number, email,
    permanent_address, aadhaar_number, pan_number, occupation,
    emergency_contact_name, emergency_contact_phone, id_proof,
  } = req.body;

  if (!user_id || !full_name || !phone_number) {
    return res.status(400).json({ message: "User ID, full name, and phone number are required" });
  }

  db.query(
    `INSERT INTO tenants (user_id, full_name, date_of_birth, gender, phone_number, email,
      permanent_address, aadhaar_number, pan_number, occupation,
      emergency_contact_name, emergency_contact_phone, id_proof)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [user_id, full_name, date_of_birth || null, gender || "male", phone_number, email || null,
     permanent_address || null, aadhaar_number || null, pan_number || null, occupation || null,
     emergency_contact_name || null, emergency_contact_phone || null, id_proof || null],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to create tenant", error: err.message });
      res.status(201).json({ tenant_id: result.insertId, message: "Tenant created" });
    }
  );
});

// Get all tenants
router.get("/", verifyToken, (req, res) => {
  db.query("SELECT * FROM tenants ORDER BY tenant_id DESC", (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch tenants" });
    res.json(results);
  });
});

// Get single tenant with family members
router.get("/:id", verifyToken, (req, res) => {
  db.query("SELECT * FROM tenants WHERE tenant_id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch tenant" });
    if (!results.length) return res.status(404).json({ message: "Tenant not found" });

    db.query("SELECT * FROM family_members WHERE tenant_id = ? ORDER BY member_id", [req.params.id], (err2, members) => {
      if (err2) return res.status(500).json({ message: "Failed to fetch family members" });
      res.json({ ...results[0], family_members: members });
    });
  });
});

// Update tenant
router.put("/:id", verifyToken, (req, res) => {
  const {
    full_name, date_of_birth, gender, phone_number, email,
    permanent_address, aadhaar_number, pan_number, occupation,
    emergency_contact_name, emergency_contact_phone, id_proof,
  } = req.body;

  db.query(
    `UPDATE tenants SET full_name=?, date_of_birth=?, gender=?, phone_number=?, email=?,
      permanent_address=?, aadhaar_number=?, pan_number=?, occupation=?,
      emergency_contact_name=?, emergency_contact_phone=?, id_proof=?
     WHERE tenant_id=?`,
    [full_name, date_of_birth || null, gender, phone_number, email || null,
     permanent_address || null, aadhaar_number || null, pan_number || null, occupation || null,
     emergency_contact_name || null, emergency_contact_phone || null, id_proof || null,
     req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to update tenant", error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Tenant not found" });
      res.json({ message: "Tenant updated" });
    }
  );
});

// Delete tenant
router.delete("/:id", verifyToken, (req, res) => {
  db.query("DELETE FROM tenants WHERE tenant_id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to delete tenant" });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Tenant not found" });
    res.json({ message: "Tenant deleted" });
  });
});

// ==================== FAMILY MEMBERS ====================

// Get family members for a tenant
router.get("/:id/family", verifyToken, (req, res) => {
  db.query("SELECT * FROM family_members WHERE tenant_id = ? ORDER BY member_id", [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch family members" });
    res.json(results);
  });
});

// Add family member
router.post("/:id/family", verifyToken, (req, res) => {
  const { full_name, relationship, date_of_birth, gender, aadhaar_number, occupation, phone_number } = req.body;

  if (!full_name || !relationship) {
    return res.status(400).json({ message: "Name and relationship are required" });
  }

  db.query(
    `INSERT INTO family_members (tenant_id, full_name, relationship, date_of_birth, gender, aadhaar_number, occupation, phone_number)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.params.id, full_name, relationship, date_of_birth || null, gender || "male", aadhaar_number || null, occupation || null, phone_number || null],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to add family member", error: err.message });
      res.status(201).json({ member_id: result.insertId, message: "Family member added" });
    }
  );
});

// Update family member
router.put("/:id/family/:memberId", verifyToken, (req, res) => {
  const { full_name, relationship, date_of_birth, gender, aadhaar_number, occupation, phone_number } = req.body;

  db.query(
    `UPDATE family_members SET full_name=?, relationship=?, date_of_birth=?, gender=?, aadhaar_number=?, occupation=?, phone_number=?
     WHERE member_id=? AND tenant_id=?`,
    [full_name, relationship, date_of_birth || null, gender, aadhaar_number || null, occupation || null, phone_number || null,
     req.params.memberId, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to update family member" });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Family member not found" });
      res.json({ message: "Family member updated" });
    }
  );
});

// Delete family member
router.delete("/:id/family/:memberId", verifyToken, (req, res) => {
  db.query(
    "DELETE FROM family_members WHERE member_id = ? AND tenant_id = ?",
    [req.params.memberId, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to delete family member" });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Family member not found" });
      res.json({ message: "Family member deleted" });
    }
  );
});

module.exports = router;
