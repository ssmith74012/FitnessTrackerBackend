const express = require('express');
const router = express.Router();

const { requiredUser } = require("./utils");
const {
	createActivity,
	getActivityById,
	getActivityByName,
	getAllActivities,
	getPublicRoutinesByActivity,
	updateActivity,
} = require("../db");

//GET /api/activities/:activityId/routines
router.get("/:activityId/routines", async (req, res, next) => {
	const { activityId } = req.params;

	try {
		
		const activity = await getActivityById(activityId);
		if (!activity) {
			res.status(400).send({
				error: "ActivityNotFoundError",
				message: `Activity ${activityId} not found`,
				name: "ActivityDoesNotExist",
			});
		}
		
		const publicRoutines = await getPublicRoutinesByActivity(activity);
		res.send(publicRoutines);
	} catch ({ name, message }) {
		next({ name, message });
	}
});

//GET /api/activities
router.get('/activities', async(req, res, next) => {
    try {
		const activities = await getAllActivities();

		res.send(activities);
	} catch ({ name, message }) {
		next({ name, message });
	}
});

//POST /api/activities
router.post('api/activities', requiredUser, async(req, res, next) => {
    const { name, description } = req.body;

	try {
		const activity = await getActivityByName(name);
		if (activity) {
			res.send({
				error: "DuplicateActivityNameError",
				message: `An activity with name ${name} already exists`,
				name: "DuplicateActivityName",
			});
		} else {
			const newActivity = await createActivity({ name, description });

			res.send(newActivity);
		}
	} catch ({ name, message }) {
		next({ name, message });
	}
});

//PATCH /api/activities/:activityId
router.patch('/api/activities/:activityId', requiredUser, async(req, res, next) => {
    const { activityId } = req.params;
	const { name, description } = req.body;

	try {
		const checkActivityId = await getActivityById(activityId);
		
		if (!checkActivityId) {
			res.send({
				error: "ActivityIdNotFoundError",
				message: `Activity ${activityId} not found`,
				name: "ActivityIdDoesNotExist",
			});
		}

		const activityName = await getActivityByName(name);
		
		if (activityName && activityName.id !== activityId) {
			res.send({
				error: "DuplicateActivityNameError",
				message: `An activity with name ${activityName.name} already exists`,
				name: "DuplicateActivityName",
			});
		} else {
			
			const update = await updateActivity({ id: activityId, name: name, description: description });

			res.send(update);
		}
	} catch ({ name, message }) {
		next({ name, message });
	}
});

module.exports = router;
