const express = require("express");
const agentRoutes = require("./routes/agent.routes");
const metricsRoutes = require("./routes/metrics.routes");
const registerRoutes = require("./routes/register.routes");


const app = express();
app.use(express.json());

app.use("/agents", agentRoutes);
app.use("/metrics", metricsRoutes);
app.use("/auth", registerRoutes);



module.exports = app;
