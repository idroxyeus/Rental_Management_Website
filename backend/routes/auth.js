const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const verifyToken = require("../middleware/auth");

const SECRET = process.env.JWT_SECRET;

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const hashed = await bcrypt.hash(password, 10);
    db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashed, role || "tenant"],
      (err, result) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            console.log("Duplicate registration attempt caught for:", email);
            return res.status(409).json({ message: "This email is already in use. You cannot sign up using this email." });
          }
          return res.status(500).json({ message: "Registration failed" });
        }
        
        // Generate token for auto-login
        const token = jwt.sign(
          { id: result.insertId, role: role || "tenant", name: name },
          SECRET,
          { expiresIn: "2h" }
        );
        
        res.status(201).json({ 
          token, 
          user: { name, role: role || "tenant" },
          message: "User registered successfully" 
        });
      }
    );
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (!results.length) return res.status(401).json({ message: "Invalid email or password" });

    const match = await bcrypt.compare(password, results[0].password);
    if (!match) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: results[0].user_id, role: results[0].role, name: results[0].name },
      SECRET,
      { expiresIn: "2h" }
    );
    res.json({ token, user: { name: results[0].name, role: results[0].role } });
  });
});

// Profile
router.get("/profile", verifyToken, (req, res) => {
  db.query("SELECT user_id, name, email, role FROM users WHERE user_id = ?", [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (!results.length) return res.status(404).json({ message: "User not found" });
    res.json(results[0]);
  });
});

// Me (Full Context)
router.get("/me", verifyToken, (req, res) => {
  db.query("SELECT user_id, name, email, role FROM users WHERE user_id = ?", [req.user.id], (err, users) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (!users.length) return res.status(404).json({ message: "User not found" });
    
    const user = users[0];
    const payload = { user };

    if (user.role === "tenant") {
      db.query("SELECT * FROM tenants WHERE user_id = ?", [user.user_id], (err, tenants) => {
        if (!err && tenants.length) {
          payload.tenant = tenants[0];
          db.query("SELECT * FROM leases WHERE tenant_id = ? AND status = 'active'", [payload.tenant.tenant_id], (err, leases) => {
            payload.activeLease = (!err && leases.length) ? leases[0] : null;
            res.json(payload);
          });
        } else {
          payload.tenant = null;
          payload.activeLease = null;
          res.json(payload);
        }
      });
    } else if (user.role === "landlord") {
      db.query("SELECT * FROM landlords WHERE user_id = ?", [user.user_id], (err, landlords) => {
        payload.landlord = (!err && landlords.length) ? landlords[0] : null;
        res.json(payload);
      });
    } else {
      res.json(payload); // admin
    }
  });
});

module.exports = router;
