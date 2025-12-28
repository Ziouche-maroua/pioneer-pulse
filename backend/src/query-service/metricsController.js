const pool = require('../db/read.js');

// GET /api/services - Liste tous les services
exports.getServices = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM services_status_view
      ORDER BY last_heartbeat DESC NULLS LAST
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

// GET /api/metrics/hourly - Métriques horaires agrégées
exports.getHourlyMetrics = async (req, res) => {
  const { service_id, hours = 24 } = req.query;

  if (!service_id) {
    return res.status(400).json({
      success: false,
      error: 'service_id is required'
    });
  }

  try {
    const result = await pool.query(`
      SELECT 
        service_id,
        hour_timestamp,
        avg_cpu,
        min_cpu,
        max_cpu,
        avg_memory,
        min_memory,
        max_memory,
        avg_disk,
        min_disk,
        max_disk,
        avg_load,
        total_network_rx,
        total_network_tx,
        avg_gpu,
        sample_count
      FROM system_metrics_hourly_agg
      WHERE service_id = $1
        AND hour_timestamp >= NOW() - INTERVAL '${parseInt(hours)} hours'
      ORDER BY hour_timestamp DESC
    `, [service_id]);

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

// GET /api/metrics/latest - Dernières métriques de tous les services
exports.getLatestMetrics = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM system_metrics_latest_view
      ORDER BY latest_timestamp DESC
    `);

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

// GET /api/metrics/latest/:service_id - Dernières métriques d'un service
exports.getLatestMetricsByService = async (req, res) => {
  const { service_id } = req.params;

  try {
    const result = await pool.query(`
      SELECT * FROM system_metrics_latest_view
      WHERE service_id = $1
    `, [service_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Service metrics not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching latest metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch latest metrics'
    });
  }
};

// GET /api/dashboard - Vue d'ensemble complète
exports.getDashboard = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM dashboard_summary_view
      WHERE id = 1
    `);

    res.json({
      success: true,
      data: result.rows[0] || null
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data'
    });
  }
};

// GET /api/processes - Métriques des processus
exports.getProcesses = async (req, res) => {
  const { service_id, limit = 100 } = req.query;

  try {
    let query = `
      SELECT * FROM process_metrics_view
    `;
    const params = [];

    if (service_id) {
      query += ` WHERE service_id = $1`;
      params.push(service_id);
    }

    query += ` ORDER BY timestamp DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));

    const result = await pool.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching processes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch processes'
    });
  }
};

// GET /api/alerts - Alertes actives
exports.getAlerts = async (req, res) => {
  const { service_id, severity, resolved } = req.query;

  try {
    let query = `SELECT * FROM alert_triggers_view WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (service_id) {
      query += ` AND service_id = $${paramIndex}`;
      params.push(service_id);
      paramIndex++;
    }

    if (severity) {
      query += ` AND severity = $${paramIndex}`;
      params.push(severity);
      paramIndex++;
    }

    if (resolved !== undefined) {
      query += ` AND resolved = $${paramIndex}`;
      params.push(resolved === 'true');
      paramIndex++;
    }

    query += ` ORDER BY triggered_at DESC`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alerts'
    });
  }
};

// GET /api/health-history - Historique de santé d'un service
exports.getHealthHistory = async (req, res) => {
  const { service_id, limit = 100 } = req.query;

  if (!service_id) {
    return res.status(400).json({
      success: false,
      error: 'service_id is required'
    });
  }

  try {
    const result = await pool.query(`
      SELECT * FROM service_health_history
      WHERE service_id = $1
      ORDER BY timestamp DESC
      LIMIT $2
    `, [service_id, parseInt(limit)]);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching health history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch health history'
    });
  }
};

// GET /api/trends - Tendances de performance
exports.getTrends = async (req, res) => {
  const { service_id, period_type = 'daily' } = req.query;

  if (!service_id) {
    return res.status(400).json({
      success: false,
      error: 'service_id is required'
    });
  }

  try {
    const result = await pool.query(`
      SELECT * FROM performance_trends
      WHERE service_id = $1 AND period_type = $2
      ORDER BY period_start DESC
      LIMIT 30
    `, [service_id, period_type]);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trends'
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