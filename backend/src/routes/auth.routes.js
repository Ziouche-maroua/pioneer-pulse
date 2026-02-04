const express = require("express");
const router = express.Router();
const { registerUser } = require("../commands/register.command");
const { loginUser, getUserById } = require("../commands/login.command");
const { authenticateToken } = require("../middleware/auth.middleware");

router.post("/register", async (req, res) => {
  console.log("📝 Register request:", req.body.email);
  
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Username, email, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters",
      });
    }

    const user = await registerUser(username, email, password);
    
    console.log("✅ User registered:", user.id);
    
    res.status(201).json({
      success: true,
      message: "Registration successful",
      user,
    });
    
  } catch (err) {
    console.error("❌ Register error:", err.message);
    
    if (err.message.includes("already exists")) {
      return res.status(409).json({
        success: false,
        error: err.message,
      });
    }

    res.status(500).json({
      success: false,
      error: "Registration failed",
      details: err.message,
    });
  }
});

router.post("/login", async (req, res) => {
  console.log("🔐 Login attempt:", req.body.email);
  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    const { user, token } = await loginUser(email, password);
    
    console.log("✅ Login successful:", user.id);
    
    res.json({
      success: true,
      user,
      token,
    });
    
  } catch (err) {
    console.error("❌ Login error:", err.message);
    
    res.status(401).json({
      success: false,
      error: err.message,
    });
  }
});

router.post("/logout", authenticateToken, (req, res) => {
  console.log("👋 Logout:", req.user.userId);
  
  res.json({
    success: true,
    message: "Logout successful",
  });
});

router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);
    
    res.json({
      success: true,
      user,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      error: "User not found",
    });
  }
});

router.get("/verify", authenticateToken, (req, res) => {
  res.json({
    success: true,
    valid: true,
    user: {
      id: req.user.userId,
      username: req.user.username,
      email: req.user.email,
    },
  });
});

module.exports = router;