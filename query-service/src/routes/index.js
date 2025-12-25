const express = require('express');
const router = express.Router();
const metricsController = require('../controllers/metricsController');

// Agent routes
router.get('/agents', metricsController.getAgents);
router.get('/agents/:id', metricsController.getAgentById);

// Metrics routes
router.get('/metrics/hourly', metricsController.getHourlyMetrics);
router.get('/metrics/latest', metricsController.getLatestMetrics);

// Dashboard route
router.get('/dashboard', metricsController.getDashboard);

module.exports = router;