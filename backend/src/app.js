const express = require("express");
const { createMetric } = require("./commands/metrics.command");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Command  (WRITE)
app.post("/metrics", createMetric);

module.exports = app;
