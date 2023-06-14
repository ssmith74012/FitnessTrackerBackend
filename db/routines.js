const { attachActivitiesToRoutines } = require("./activities");
const client = require("./client");

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const{ rows: [routine] } = await client.query(`
      INSERT INTO routines ("creatorId", "isPublic", name, goal)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (name) DO NOTHING
      RETURNING *
    `, [creatorId, isPublic, name, goal]);
  
  return routine;
} catch (error) {
  console.error("Error creating routine:", error);
  throw error;
}
}


async function getRoutineById(id) {
  try {
  const { rows: [routine] } = await client.query(`
    SELECT ("creatorId", "isPublic", name, goal) FROM routines
    WHERE id=$1;
  `)
  // if (!id) {
  //   return null;
  // }
  
  return routine;
} catch (error) {
  console.error("Error finding routine with that ID!");
  throw error;
}
}

async function getRoutinesWithoutActivities() {
  try {
		const { rows: routines } = await client.query(
			`
      SELECT *
      FROM routines
      LEFT JOIN routine_activities ON routines.id = routine_activities."routineId"
      WHERE routine_activities."activityId" IS NULL;
    `
		);
		return routines;
	} catch (error) {
		console.error("Error retrieving routines without activities:", error);
		throw error;
	}
}

async function getAllRoutines() {
  // eslint-disable-next-line no-useless-catch
  try{
    const { rows: routines } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    `);

      return attachActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}

async function getAllPublicRoutines() {
  // eslint-disable-next-line no-useless-catch
  try{
  const {rows: routines } = await client.query(`
  SELECT routines.*, users.username AS "creatorName"
  FROM routines
  JOIN users ON routines."creatorId" = users.id
  WHERE "isPublic" = true;
  `);
  return attachActivitiesToRoutines(routines);
  } catch(error) {
    throw error;
  }
}

async function getAllRoutinesByUser({ username }) {
  // eslint-disable-next-line no-useless-catch
  try{
    const { rows: routines } = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    WHERE username = $1
    `, [username]);

    return attachActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }

}

async function getPublicRoutinesByUser({ username }) {
  // eslint-disable-next-line no-useless-catch
  try {
    const {rows: routines} = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users on routines."creatorId" = users.id
      WHERE username=$1 
      AND "isPublic" = true;
    `, [username]);

    return attachActivitiesToRoutines(routines);
  } catch(error) {
    throw error;
  }
}

async function getPublicRoutinesByActivity({ id }) {
  // eslint-disable-next-line no-useless-catch
  try {
    const {rows: routines} = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    JOIN routine_activities ON routine_activities."routineId" = routines.id
    WHERE routines."isPublic" = true AND routine_activities."activityId" = $1;
    `, [id]);
    
    return attachActivitiesToRoutines(routines);
  } catch(error) {
    throw error;
  }
}

async function updateRoutine({ id, ...fields }) {
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  if (setString.length === 0) {
    return;
  }

  try {
    const { rows: [routine]} = await client.query(`
      UPDATE routines
      SET ${ setString }
      WHERE id=${ id }
      RETURNING *;
    `, Object.values(fields));

    return routine;
  } catch (error) {
    console.log("Error updating routine");
    throw error;
  }


}
   



async function destroyRoutine(id) {
  try{

    await client.query(
			`
      DELETE FROM routine_activities
      WHERE "routineId" = $1
      RETURNING *;
      `,
			[id]
		);

    const { rows: [routine] } = await client.query(`
      DELETE FROM routines
      WHERE id=$1
      RETURNING *;
    `, [id]);

    return routine;
  } catch(error) {
    console.error("Error deleting routine", error);
    throw error;
  }
}


module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
