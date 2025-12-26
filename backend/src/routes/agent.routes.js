const express = require("express");
const { registerAgent } = require("../commands/agent.command");

const router = express.Router();

router.post("/register", registerAgent);

module.exports = router;
