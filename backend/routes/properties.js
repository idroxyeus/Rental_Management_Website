const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/auth");

// Create property
router.post("/", verifyToken, (req, res) => {
  const { address, property_type, rent_amount, status, images, facilities } = req.body;

  if (!address || !property_type || !rent_amount) {
    return res.status(400).json({ message: "Address, type and rent amount are required" });
  }

  db.query(
    "INSERT INTO properties (address, property_type, rent_amount, status, images, facilities) VALUES (?, ?, ?, ?, ?, ?)",
    [address, property_type, rent_amount, status || "vacant", JSON.stringify(images || []), JSON.stringify(facilities || [])],
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
      const parsed = results.map(r => ({
        ...r,
        images: JSON.parse(r.images || "[]"),
        facilities: JSON.parse(r.facilities || "[]")
      }))
      res.json(parsed);
    });
  } else {
    db.query("SELECT * FROM properties ORDER BY property_id DESC", (err, results) => {
      if (err) return res.status(500).json({ message: "Failed to fetch properties" });
      const parsed = results.map(r => ({
        ...r,
        images: JSON.parse(r.images || "[]"),
        facilities: JSON.parse(r.facilities || "[]")
      }))
      res.json(parsed);
    });
  }
});

// Get single property
router.get("/:id", verifyToken, (req, res) => {
  db.query("SELECT * FROM properties WHERE property_id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch property" });
    if (!results.length) return res.status(404).json({ message: "Property not found" });
    const r = results[0];
    res.json({
      ...r,
      images: JSON.parse(r.images || "[]"),
      facilities: JSON.parse(r.facilities || "[]")
    });
  });
});

// Update property
router.put("/:id", verifyToken, (req, res) => {
  const { address, property_type, rent_amount, status, images, facilities } = req.body;

  db.query(
    "UPDATE properties SET address = ?, property_type = ?, rent_amount = ?, status = ?, images = ?, facilities = ? WHERE property_id = ?",
    [address, property_type, rent_amount, status, JSON.stringify(images || []), JSON.stringify(facilities || []), req.params.id],
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

// Express interest in a property
router.post("/:id/interest", verifyToken, (req, res) => {
  if (req.user.role !== "tenant") return res.status(403).json({ message: "Only tenants can express interest" });
  
  db.query("SELECT tenant_id FROM tenants WHERE user_id = ?", [req.user.id], (err, tenants) => {
    if (err) return res.status(500).json({ message: "Server error" });

    const insertInterest = (tId) => {
      db.query(
        "INSERT INTO property_interests (property_id, tenant_id) VALUES (?, ?)",
        [req.params.id, tId],
        (err) => {
          if (err) {
            if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ message: "Already expressed interest" });
            return res.status(500).json({ message: "Failed to express interest" });
          }
          res.status(201).json({ message: "Interest recorded" });
        }
      );
    };

    if (!tenants.length) {
      // Auto-create tenant profile so they aren't blocked!
      db.query(
        "INSERT INTO tenants (user_id, full_name, phone_number, gender, aadhaar_number, occupation) VALUES (?, ?, ?, ?, ?, ?)",
        [req.user.id, req.user.name || "Tenant User", "pending", "other", "pending", "pending"],
        (err2, result) => {
          if (err2) return res.status(500).json({ message: "Failed to auto-create tenant profile" });
          insertInterest(result.insertId);
        }
      );
    } else {
      insertInterest(tenants[0].tenant_id);
    }
  });
});

// Get interests for a property
router.get("/:id/interests", verifyToken, (req, res) => {
  db.query("SELECT tenant_id FROM property_interests WHERE property_id = ?", [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to fetch interests" });
    res.json(results.map(r => r.tenant_id));
  });
});

// Get properties current tenant is interested in
router.get("/interests/me", verifyToken, (req, res) => {
  if (req.user.role !== "tenant") return res.json([]);
  db.query("SELECT tenant_id FROM tenants WHERE user_id = ?", [req.user.id], (err, tenants) => {
    if (err || !tenants.length) return res.json([]);
    const tid = tenants[0].tenant_id;
    db.query("SELECT property_id FROM property_interests WHERE tenant_id = ?", [tid], (err, results) => {
      if (err) return res.status(500).json({ message: "Error" });
      res.json(results.map(r => r.property_id));
    });
  });
});

module.exports = router;
