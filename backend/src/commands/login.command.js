const writePool = require("../db/writedb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || "0cc4beb0453cce0fbb72bc9319cee620";
const JWT_EXPIRES_IN = "7d";

async function loginUser(email, password) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const client = await writePool.connect();

  try {
    const result = await client.query(
      `SELECT id, username, email, password, created_at 
       FROM users 
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error("Invalid email or password");
    }

    const user = result.rows[0];

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
      },
    };

  } finally {
    client.release();
  }
}

async function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new Error("Token expired");
    }
    if (err.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    }
    throw err;
  }
}

async function getUserById(userId) {
  const client = await writePool.connect();

  try {
    const result = await client.query(
      `SELECT id, username, email, created_at 
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    return result.rows[0];

  } finally {
    client.release();
  }
}

module.exports = {
  loginUser,
  verifyToken,
  getUserById,
  JWT_SECRET,
};