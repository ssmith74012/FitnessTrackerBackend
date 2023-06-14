const express = require("express");
const routineRouter = express.Router();
const { requiredUser } = require("./utils");
const {
	addActivityToRoutine,
	createRoutine,
	destroyRoutine,
	getAllRoutines,
	getRoutineById,
	updateRoutine,
    getAllPublicRoutines
} = require("../db");

// GET /api/routines
routineRouter.get("/", async (req, res, next) => {
    const allRoutines = await getAllPublicRoutines;
    res.send(allRoutines);
    next();
})

// POST /api/routines
routineRouter.post("/", async (req, res, next) => {
    const { isPublic, name, goal } = req.body;
    const { id: userId } = req.user;

    const routines = await getAllRoutines();
		const routineExists = routines.find(routine => routine.name === name);
		if (routineExists) {
			res.send({
				error: "DuplicateRoutineNameError",
				message: `A routine with name ${name} already exists`,
				name: "DuplicateRoutineName",
			});
	} else {
		const newRoutine = await createRoutine({ creatorId: userId, isPublic, name, goal });

		res.send(newRoutine);
		}
        next();
})

// PATCH /api/routines/:routineId
routineRouter.patch("/routines/:routineId", requiredUser, async(req, res, next) => {
    const { routineId } = req.params;
	const { isPublic, name, goal } = req.body;
    const { id: userId, username } = req.user;

    const checkRoutineId = await getRoutineById(routineId);
    if (checkRoutineId != userId) {
        res.send({
            error: "routinesDoNotMatch",
            message: `User ${username} is not allowed to update ${checkRoutineId.name}`,
            name: "NotCreated",
        });

        const update = await updateRoutine({
            id: routineId,
			isPublic,
			name,
			goal,
        });
        res.send(update);
    }
    next();
})

// DELETE /api/routines/:routineId
routineRouter.delete("/:routineId", requiredUser, async(req, res, next) => {
    const { routineId } = req.params;
	const { id: userId, username } = req.user;

    const deleteId = await getRoutineById(routineId);


   if( deleteId.creatorId != userId) {
    res.send({
        error:"UnauthorizedError",
        message: `User ${username} is not allowed to delete ${deleteId.name}`,
        name:"NoRoutine",
    })
   }
   const deleteRoutine = await destroyRoutine(routineId);
   next(deleteRoutine);
})


// POST /api/routines/:routineId/activities
routineRouter.post("/:routineId/activities", async(req, res, next) => {
    const { routineId } = req.params;
	const { activityId, duration, count } = req.body;

    const checkRoutineId = await getRoutineById(routineId);
    
    let error = {
        error: "error",
        message: `Activity ID ${activityId} already exists in Routine ID ${routineId}`,
        name: "error",
      };

      const duplicate = false;

    if(!checkRoutineId) {
        res.send ({
            error:"error",
            message: "Does not exist",
            name: "doesnotexist",
        });
    } else if (duplicate) {
        res.send(error);
    }

    const addRoutineActivity = await addActivityToRoutine({
        routineId,
			activityId,
			duration,
			count,
    });
    
    res.send(addRoutineActivity);
    next();
})


module.exports = routineRouter;
