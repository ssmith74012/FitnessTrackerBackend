const express = require('express');
const apiRouter = express.Router();

// GET /api/activities/:activityId/routines
apiRouter.get('/api/activities/:activityId/routines', async(req, res, next) => {
    try{


    } catch (error) {
        next(error)
    }
})

// GET /api/activities
apiRouter.get('/api/activities', async(req, res, next) => {
    try{


    } catch(error) {
        next(error)
    }
})

// POST /api/activities
apiRouter.post('api/activities', async(req, res, next) => {
    try{


    } catch(error) {
        next(error)
    }
})

// PATCH /api/activities/:activityId
apiRouter.patch('/api/activities/:activityId', async(req, res, next) => {
    try {


    } catch (error) {
        next(error)
    }
    
})

module.exports = apiRouter;
