const express = require("express");
const { createMetric } = require("./commands/metrics.command");
const getDashboard = require("./queries/getDashboard");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Command  (WRITE)
app.post("/metrics", createMetric);

// Query  (READ)
app.get("/dashboard", getDashboard);

module.exports = app;
