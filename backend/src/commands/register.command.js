const writePool = require("../db/writedb");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

/**
 * Emit event to events table
 */
async function emitEvent(client, eventType, aggregateType, aggregateId, payload) {
  await client.query(
    `INSERT INTO events (event_type, aggregate_type, aggregate_id, payload, created_at)
     VALUES ($1, $2, $3, $4, NOW())`,
    [eventType, aggregateType, aggregateId, JSON.stringify(payload)]
  );
}

/**
 * Register a new user
 */
async function registerUser(username, email, password) {
  if (!username || !email || !password) {
    throw new Error("Missing required fields: username, email, password");
  }

  const client = await writePool.connect();

  try {
    await client.query("BEGIN");

    const id = uuidv4();
    const hashed = await bcrypt.hash(password, 10);

    // 1. Insert user into write DB
    const result = await client.query(
      `INSERT INTO users (id, username, email, password, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, username, email, created_at`,
      [id, username, email, hashed]
    );

    const user = result.rows[0];

    // 2. Emit event for read DB or auditing (password is excluded)
    await emitEvent(
      client,
      "user_registered",
      "user",
      user.id,
      {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at
      }
    );

    await client.query("COMMIT");

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at
    };

  } catch (err) {
    await client.query("ROLLBACK");

    // Handle unique constraint violation for username/email
    if (err.code === "23505") { // PostgreSQL unique violation
      throw new Error("Username or email already exists");
    }

    throw err;
  } finally {
    client.release();
  }
}

module.exports = { registerUser };