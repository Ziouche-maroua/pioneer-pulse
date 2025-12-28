const express = require('express');
const router = express.Router();
const metricsController = require('../controllers/metricsController');

// Service routes
router.get('/services', metricsController.getServices);
router.get('/services/:id', metricsController.getServiceById);

// Metrics routes
router.get('/metrics/hourly', metricsController.getHourlyMetrics);
router.get('/metrics/latest', metricsController.getLatestMetrics);
router.get('/metrics/latest/:service_id', metricsController.getLatestMetricsByService);

// Dashboard route
router.get('/dashboard', metricsController.getDashboard);

// Process routes
router.get('/processes', metricsController.getProcesses);

// Alert routes
router.get('/alerts', metricsController.getAlerts);

// Health history
router.get('/health-history', metricsController.getHealthHistory);

// Trends
router.get('/trends', metricsController.getTrends);

// Replication routes
router.get('/replication/status', metricsController.getReplicationStatus);
router.get('/replication/metrics', metricsController.getReplicationMetrics);

module.exports = router;