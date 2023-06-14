/* eslint-disable no-useless-catch */
const client = require('./client');

// database functions
async function createActivity({ name, description }) {
  try{
    const { rows: [activity] } = await client.query(`
      INSERT INTO activities (name, description)
      VALUES ($1, $2)
      ON CONFLICT (name) DO NOTHING
      RETURNING *
    `, [name, description]);

    return activity;
  } catch (error) {
    console.error("Error creating activity:", error);
    throw error;
  }
}

async function getAllActivities() {
  try{
    const { rows: activities } = await client.query(`
    SELECT * FROM activities;`);

    return activities;
  } catch(error) {
    console.error("Error retrieving activities:", error);
    throw error;
  }
}

async function getActivityById(id) {
  try{
    const { rows: [activity] } =await client.query(`
      SELECT * FROM activities
      WHERE id=$1;
    `, [id])
    if (!id) {
      console.log(`${id} does not exist`);
      return null;
    }
    return activity;
  } catch (error) {
    console.log("Error finding activity by activityId:", error);
    throw error;
  }
}

async function getActivityByName(name) {
  try{
    const {rows: [activity] } = await client.query(`
      SELECT * FROM activities
      WHERE name=$1;
    `, [name]);
    return activity;
  } catch(error) {
    console.error("Error finding activity by name:", error);
    throw error;
  }
}


async function attachActivitiesToRoutines(routines) {
  const routineMap = routines.map(async (routine) => {
    try{
    const { rows } = await client.query(
      `
    SELECT activities.*, routine_activities.duration, routine_activities.count,
    routine_activities.id AS "routineActivityId", routine_activities."routineId" FROM routine_activities 
    JOIN activities
    ON activities.id = routine_activities."activityId"
    AND routine_activities."routineId" =$1;`,
      [routine.id]
    );
    routine.activities = rows;
    return routine;
  } catch(error) {
  const newRoutines = await Promise.all(routineMap);
  return newRoutines;
}
  });
  const newRoutines = await Promise.all(routineMap);
  return newRoutines;
}

async function updateActivity({ id, ...fields }) {
  // don't try to update the id
  // do update the name and description
  // return the updated activity
  
  try{
    // const keys = Object.keys(fields);

    for (const key in fields) {
      await client.query(`
      UPDATE activities SET ${key} = '${fields[key]}' WHERE id = ${id};
      `)
    }

    const {
      rows: [response],
    } = await client.query(` SELECT * FROM activities WHERE id = ${id};`);
    
    return response;

  } catch(error) {
      console.error("Error updating activity");
      throw error;

  }
 
}



module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};
