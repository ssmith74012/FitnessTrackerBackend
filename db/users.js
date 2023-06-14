const client = require("./client");
const bcrypt = require("bcrypt");

// database functions
const SALT_COUNT = 10;

// user functions
async function createUser({ username, password }) {
	const hashedPassword = await bcrypt.hash(password, SALT_COUNT);
	const create = { username, hashedPassword };
  // console.log("in createUser, creating user " + username + " with password " + password);
  // console.log("username=", username);
  // console.log("passwrod=", password);
	try {
		const {
			rows: [user]
		} = await client.query(
    `INSERT INTO users (username, password)
    VALUES ($1, $2)
    ON CONFLICT (username) DO NOTHING
    RETURNING *;`
    ,[username, hashedPassword]
		);
		delete user.password;

		return user;
	} catch (error) {
		console.log("Error creating user:", error);
		throw error;
	}
}

// async function createUser({ username, password }) {
//   try {
//     const hashedPassword = bcrypt.hashSync(password, 10);
//     const result = await client.query(
//       `
//     INSERT INTO users(username, password)
//     VALUES ($1, $2)
//     ON CONFLICT (username) DO NOTHING
//     RETURNING *;
//     `,
//       [username, hashedPassword]
//     );

//     return { id: result.rows[0].id, username: result.rows[0].username };
//   } catch (error) {
//     console.log("Error occured while creating user");
//     throw error;
//   }
// }


async function getUser({ username, password }) {
	// console.log("in getUser() looking for " + username + " with password " + password);

	try {
		const user = await getUserByUsername(username);
		const hashedPassword = user.password;
		
		const isValid = await bcrypt.compare(password, hashedPassword);
		if (isValid) {
			delete user.password;

			return user;
		} else {
			return null;
		}
	} catch (error) {
		console.log("Error finding user:", error);
		throw error;
	}
}


async function getUserById(userId) {
  try {
    const { rows: [user] } = await client.query(`
      SELECT * FROM users
      WHERE id=$1;
    ` ,[userId]);
    if(!user) {
      console.log(`${userId} does not exist`);
			return null;
    }
    delete user.password;
    return user;
  } catch (error) {
    console.log("Error getting username ID!");
    throw error;
  }
}

async function getUserByUsername(userName) {
try {
  const { rows: [user] } = await client.query(`
    SELECT * FROM users
    WHERE username='${userName}';
  `)

  if(!user) {
    return null;
  }

  return user;
} catch (error) {
  console.log("Error getting username!");
  throw error;
}
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
};
