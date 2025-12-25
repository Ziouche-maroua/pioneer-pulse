const pool = require('../config/database');

// GET /api/agents - Liste tous les agents avec leur statut
exports.getAgents = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM agent_status_view
      ORDER BY updated_at DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agents'
    });
  }
};

// GET /api/agents/:id - Détails d'un agent spécifique
exports.getAgentById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT * FROM agent_status_view
      WHERE agent_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agent'
    });
  }
};

// GET /api/metrics/hourly - Métriques agrégées par heure
exports.getHourlyMetrics = async (req, res) => {
  const { agent_id, metric_type, hours = 24 } = req.query;

  if (!agent_id || !metric_type) {
    return res.status(400).json({
      success: false,
      error: 'agent_id and metric_type are required'
    });
  }

  try {
    const result = await pool.query(`
      SELECT 
        agent_id,
        metric_type,
        hour_timestamp,
        avg_value,
        min_value,
        max_value,
        count
      FROM metrics_hourly_agg
      WHERE agent_id = $1
        AND metric_type = $2
        AND hour_timestamp >= NOW() - INTERVAL '${parseInt(hours)} hours'
      ORDER BY hour_timestamp DESC
    `, [agent_id, metric_type]);

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

// GET /api/dashboard - Vue d'ensemble pour le dashboard
exports.getDashboard = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        agent_id,
        agent_name,
        metric_type,
        latest_value,
        latest_timestamp,
        trend
      FROM dashboard_metrics_view
      ORDER BY agent_id, metric_type
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

// GET /api/metrics/latest - Dernières métriques de tous les agents
exports.getLatestMetrics = async (req, res) => {
  const { metric_type } = req.query;

  try {
    let query = `
      SELECT * FROM dashboard_metrics_view
    `;

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