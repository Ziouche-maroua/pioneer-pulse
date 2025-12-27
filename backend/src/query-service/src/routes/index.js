const express = require('express');
const router = express.Router();
const metricsController = require('../controllers/metricsController');

// Service routes
router.get('/services', metricsController.getServices);
router.get('/services/:id', metricsController.getServiceById);

// Metrics routes
router.get('/metrics/hourly', metricsController.getHourlyMetrics);
router.get('/metrics/latest', metricsController.getLatestMetrics);

// Dashboard route
router.get('/dashboard', metricsController.getDashboard);

// Replication routes
router.get('/replication/status', metricsController.getReplicationStatus);
router.get('/replication/metrics', metricsController.getReplicationMetrics);

module.exports = router;