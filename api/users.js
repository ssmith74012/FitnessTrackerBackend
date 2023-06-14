
const express = require("express");
const { getUserByUsername, getUserById, createUser, getAllRoutinesByUser, getPublicRoutinesByUser } = require("../db");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const requiredUser = require("./utils");

// POST /api/users/register
router.post("/register", async(req, res, next) => {
    const {username, password} = req.body;
    try{
    const UsernameAlreadyExist = await getUserByUsername(username);
    
    if(UsernameAlreadyExist) {
        res.send({
            error: "error",
            message: `${username} already exists`,
            name: "username already exists",
        });
    } else {
        const user = await createUser({ username, password });
        const token = jwt.sign(
          {
            id: user.id,
            username,
          },
          process.env.JWT_SECRET || "itsASecret",
          {
            expiresIn: "1w",
          }
        );
        if (user) {
          res.send({ 
            message: "Created a user!",
             token: token,
              user: user });
        }
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  });


// POST /api/users/login
router.post("/login", async (req, res, next) => {
    const {username, password} = req.body;

    const user = await getUserByUsername(username);

    try{
        if (!user) {
            res.send({
                error: "UnauthorizedError",
                message: "Input authorized username",
                name: "UnauthorizedError"
            });
        }
        const hashedPassword = user.password;
        const passwordsMatch = await bcrypt.compare(password, hashedPassword);

        if(passwordsMatch != hashedPassword) {
            res.send({
                error:"UnauthorizedError",
                message:"Please input a password that matches.",
                name:"UnauthorizedError",
            });
        }

        const token = jwt.sign({id:user.id, username}, JWT_SECRET);
        res.send({user: {
            id: user.id,
            username: username,
        },
            token: token,
            message: "You are logged in!"});
    } catch(error) {
        next(error);
    }
});

// GET /api/users/me
router.get("/me", requiredUser, async(req, res, next) => {
    const { id: userId } = req.user;

    try {
        const user = await getUserById(userId);
        
        res.send(user);
    } catch ({name, message}) {
        next({name, message});
    }
});

// GET /api/users/:username/routines

router.get("/:username/routines", async(req, res, next) => {
    const { username } = req.params;

    let routines;

    try {
        const attachPublicRoutines = await getPublicRoutinesByUser({username});

        if (req.user.username != username) {
            routines = attachPublicRoutines;
        } else {
            const userRoutines = await getAllRoutinesByUser({username});
            routines = userRoutines;
        }
        res.send(routines);
    } catch ({name, message}) {
        next();
    }
});

module.exports = router;


