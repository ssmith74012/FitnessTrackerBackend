const express = require("express");
const router = express.Router();
const { requiredUser } = require("./utils");

const {
	getRoutineActivityById,
	getRoutineById,
	destroyRoutineActivity,
	updateRoutineActivity,
} = require("../db");


// PATCH /api/routine_activities/:routineActivityId
router.patch("/routine_activities/:routineActivityId", requiredUser, async(req, res, next) => {
    const { routineActivityId } = req.params;
	const { duration, count } = req.body;
	const { id: userId, username } = req.user;

    const routineActivity = await getRoutineActivityById(routineActivityId);
    const routine = await getRoutineById(routineActivity.routineId);

    if (!routineActivity) {
        res.send({
            error: "DeleteError",
            message: "Routine Activity does not exist",
            name: "RoutineDoesNotExist",
        });
    } else if (routine.creatorId !== userId) {
        res.status(403).send({
            error: "UnauthorizedDeleteError",
            message: `User ${username} is not allowed to update ${routine.name}`,
            name: "NotRoutineCreator",
        });

    let error = {
        error: "routine_activity error",
        message: `User ${username} is not allowed to update ${routine.name}`,
        name: "error",
    };

    const update = await updateRoutineActivity({ id: routineActivityId, duration, count });
    next(update);
    res.send(error);
}
});

// DELETE /api/routine_activities/:routineActivityId
router.delete("/:routineActivityId", requiredUser, async(req, res, next) => {
    const { routineActivityId } = req.params;
	const { id: userId, username } = req.user;
    const routineActivity = await getRoutineActivityById(routineActivityId);
    const routine = await getRoutineById(routineActivity.routineId);


    if (routine.creatorId != userId) {
        res.send({
            error: "UnauthorizedError",
            message:`User ${username} is not allowed to delete ${routine.name}`,
            name:"UnauthorizedUser",
        });
    } else{
        const destroy = await destroyRoutineActivity(routineActivityId);
        res.send(destroy);
    }
    next();
})

module.exports = router;
