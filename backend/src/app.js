const express = require("express");
const cors = require("cors");

// Routes WRITE (Member 1)
const serviceRoutes = require("./routes/service.routes");
const metricsRoutes = require("./routes/metrics.routes");
const registerRoutes = require("./routes/register.routes");

// Routes READ (Toi) ← CHANGE ICI
const readRoutes = require("./routes/read.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ========================================
// WRITE SIDE ROUTES (Member 1)
// ========================================
app.use("/service", serviceRoutes);
app.use("/metrics", metricsRoutes);
app.use("/auth", registerRoutes);

// ========================================
// READ SIDE ROUTES (Toi)
// ========================================
app.use("/api/read", readRoutes);

// ========================================
// HEALTH CHECK
// ========================================
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "pioneerpulse-backend",
    timestamp: new Date().toISOString()
  });
});

// ========================================
// ERROR HANDLERS
// ========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found"
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Internal server error"
  });
});

module.exports = app;