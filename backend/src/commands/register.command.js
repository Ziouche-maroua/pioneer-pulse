const writePool = require("../db/writedb.js");
const bcrypt = require("bcrypt");

const { v4: uuidv4 } = require("uuid");


/**
 * Register a new user
 * @param {string} username
 * @param {string} password
 */
async function registerUser(username, email, password) {
  if (!username || !email || !password) throw new Error("Missing fields");

  const hashed = await bcrypt.hash(password, 10);
  const id = uuidv4();

  await writePool.query(
    `INSERT INTO users (id, username, email, password) VALUES ($1, $2, $3, $4)`,
    [id, username, email, hashed]
  );

  return { id, username, email };
}




module.exports = { registerUser };
