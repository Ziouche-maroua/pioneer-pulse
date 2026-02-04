const express = require("express");
const cors = require("cors");


const serviceRoutes = require("./routes/service.routes");
const metricsRoutes = require("./routes/metrics.routes");
const authRoutes = require("./routes/auth.routes");

const readRoutes = require("./routes/read.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


app.use("/service", serviceRoutes);
app.use("/metrics", metricsRoutes);
app.use("/api/auth", authRoutes);


app.use("/api/read", readRoutes);


app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "pioneerpulse-backend",
    timestamp: new Date().toISOString()
  });
});


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