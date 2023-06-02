const client = require("./client");

// database functions

// user functions
async function createUser({ username, password }) {
  try {
    const {rows: [user] } = await client.query(`
    INSERT INTO users(username, password)
    VALUES ($1, $2)
    ON CONFLICT (username) DO NOTHING
    RETURNING *;
    `, [username, password]);

    return user;
  } catch (error) {
    console.error("Error creating Username!");
    throw error;
  }
}

async function getUser({ username, password }) {
  try {
    const { rows } = await client.query(`
      SELECT * FROM users;
    `, [username, password]);

    return rows;
  } catch(error) {
    console.error("Error getting user!");
    throw error;
  }
}

async function getUserById(userId) {
  try {
    const { rows: [user] } = await client.query(`
      SELECT username, password FROM users
      WHERE id=${userId};
    `)
    if(!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error getting username ID!");
    throw error;
  }
}

async function getUserByUsername(userName) {
try {
  const { rows: [user] } = await client.query(`
    SELECT username, password FROM users
    WHERE username=${userName};
  `)

  if(!user) {
    return null;
  }

  return user;
} catch (error) {
  console.error("Error getting username!");
  throw error;
}
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
