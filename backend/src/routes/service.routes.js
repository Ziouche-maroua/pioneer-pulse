const express = require("express");
const { registerService } = require("../commands/service.command");

const router = express.Router();

router.post("/register", registerService);
module.exports = router;
