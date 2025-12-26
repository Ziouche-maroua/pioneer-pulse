const express = require("express");
const router = express.Router();
const { registerUser } = require("../commands/register.command");

router.post("/register", async (req, res) => {
  console.log("REQ BODY:", req.body); 
  try {
    const { username, email, password } = req.body;
    const user = await registerUser(username, email, password);
    res.status(201).json({ message: "Registration successful", user });
  } catch (err) {
    console.error("REGISTER ERROR:", err); 
    res.status(500).json({ error: "Registration failed", details: err.message });
  }
});





module.exports = router;
