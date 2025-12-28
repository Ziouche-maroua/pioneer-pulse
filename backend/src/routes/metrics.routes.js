const express = require("express");
const { createMetrics } = require("../commands/metrics.command");

const router = express.Router();

router.post("/", createMetrics);

module.exports = router;
