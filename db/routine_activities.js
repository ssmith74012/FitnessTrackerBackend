const client = require("./client");

async function addActivityToRoutine({ routineId, activityId, duration, count }) {
	try {
		const result = await client.query(
			`
      INSERT INTO routine_activities ("routineId", "activityId", duration, count)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
			[routineId, activityId, duration, count]
		);

		return result.rows[0];
	} catch (error) {
		console.error("Error creating routine_activities:", error);
		throw error;
	}
}

async function getRoutineActivityById(id) {
  try{
    const result = await client.query(`
      SELECT * FROM routine_activities
      WHERE id=$1;
    `, [id])
    if (!id) {
      console.log(`${id} does not exist`);
      return null;
    }
    return result.rows[0];
  } catch (error) {
    console.log("Error with getRoutineActivityById");
    throw error;
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  try{
    const result = await client.query(`
      SELECT * FROM routine_activities
      WHERE "routineId"=$1;
    `, [id]);
    return result.rows;
  } catch(error) {
    console.error("Error finding activity by id:", error);
    throw error;
  }
}

async function updateRoutineActivity({ id, ...fields }) {
  try{
    
    for (const key in fields) {
      await client.query(`
      UPDATE routine_activities SET ${key} = '${fields[key]}' WHERE id = ${id};
      `)
    }

    const {
      rows: [response],
    } = await client.query(` SELECT * FROM routine_activities WHERE id = ${id};`);
    
    return response;

  } catch(error) {
      console.error("Error updating routine_activity");
      throw error;

  }
}

async function destroyRoutineActivity(id) {
  try{
    const { rows: [routine_activities] } = await client.query(`
      DELETE FROM routine_activities
      WHERE id=$1
      RETURNING *;
    `, [id]);

    return routine_activities;
  } catch(error) {
    console.error("Error deleting activity", error);
    throw error;
  }
}

async function canEditRoutineActivity(routineActivityId, userId) {
  try {
		const {
			rows: [routine_activity],
		} = await client.query(
			`
		  SELECT *
		  FROM routine_activities
		  JOIN routines ON routines.id = routine_activities."routineId"
		  WHERE routine_activities.id = $1 AND routines."creatorId" = $2;
		`,[routineActivityId, userId]
		);

		return routine_activity;
	} catch (error) {
		console.error("Error checking if user can edit routine_activity activityId:", error);
		throw error;
	}
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
