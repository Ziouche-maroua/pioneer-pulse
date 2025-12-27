const pool = require('../config/database');

// GET /api/services - Liste tous les services
exports.getServices = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM services_status_view
      ORDER BY updated_at DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch services'
    });
  }
};

// GET /api/services/:id - Détails d'un service
exports.getServiceById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT * FROM services_status_view
      WHERE service_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch service'
    });
  }
};

// GET /api/metrics/hourly - Métriques agrégées
exports.getHourlyMetrics = async (req, res) => {
  const { service_id, metric_type, hours = 24 } = req.query;

  if (!service_id || !metric_type) {
    return res.status(400).json({
      success: false,
      error: 'service_id and metric_type are required'
    });
  }

  try {
    const result = await pool.query(`
      SELECT 
        service_id,
        metric_type,
        hour_timestamp,
        avg_value,
        min_value,
        max_value,
        sample_count
      FROM metrics_hourly_agg
      WHERE service_id = $1
        AND metric_type = $2
        AND hour_timestamp >= NOW() - INTERVAL '${parseInt(hours)} hours'
      ORDER BY hour_timestamp DESC
    `, [service_id, metric_type]);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching hourly metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch metrics'
    });
  }
};

// GET /api/dashboard - Vue d'ensemble
exports.getDashboard = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        service_id,
        service_name,
        metric_type,
        latest_value,
        latest_timestamp,
        trend
      FROM dashboard_metrics_view
      ORDER BY service_id, metric_type
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data'
    });
  }
};

// GET /api/metrics/latest - Dernières métriques
exports.getLatestMetrics = async (req, res) => {
  const { metric_type } = req.query;

  try {
    let query = `SELECT * FROM dashboard_metrics_view`;
    const params = [];

    if (metric_type) {
      query += ` WHERE metric_type = $1`;
      params.push(metric_type);
    }

    query += ` ORDER BY latest_timestamp DESC`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching latest metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch latest metrics'
    });
  }
};

// GET /api/replication/status - Statut de réplication
exports.getReplicationStatus = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM replication_status
    `);

    res.json({
      success: true,
      data: result.rows[0] || null
    });
  } catch (error) {
    console.error('Error fetching replication status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch replication status'
    });
  }
};

// GET /api/replication/metrics - Historique de réplication
exports.getReplicationMetrics = async (req, res) => {
  const { limit = 100 } = req.query;

  try {
    const result = await pool.query(`
      SELECT * FROM replication_metrics
      ORDER BY measured_at DESC
      LIMIT $1
    `, [parseInt(limit)]);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching replication metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch replication metrics'
    });
  }
};