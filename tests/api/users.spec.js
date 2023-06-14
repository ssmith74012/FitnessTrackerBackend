// /*

// DO NOT CHANGE THIS FILE

// */
// require("dotenv").config();
// const request = require("supertest");
// const faker = require("faker");
// const client = require("../../db/client");
// const app = require("../../app");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const {
//   createFakeUserWithToken,
//   createFakeUserWithRoutinesAndActivities,
// } = require("../helpers");
// const {
//   expectToBeError,
//   expectNotToBeError,
//   expectToHaveErrorMessage,
// } = require("../expectHelpers");

// const { JWT_SECRET = "neverTell" } = process.env;

// const { objectContaining } = expect;

// const {
//   getPublicRoutinesByUser,
//   createUser,
//   getAllRoutinesByUser,
// } = require("../../db");
// const {
//   UserTakenError,
//   PasswordTooShortError,
//   UnauthorizedError,
// } = require("../../errors");

// describe("/api/users", () => {
//   describe("POST /api/users/register", () => {
//     it("Creates a new user.", async () => {
//       // Create some fake user data
//       const fakeUserData = {
//         username: faker.internet.userName(),
//         password: faker.internet.password(),
//       };
//       // Register the user
//       const response = await request(app)
//         .post("/api/users/register")
//         .send(fakeUserData);

//       expectNotToBeError(response.body);

//       expect(response.body).toMatchObject({
//         message: expect.any(String),
//         token: expect.any(String),
//         user: {
//           id: expect.any(Number),
//           username: fakeUserData.username,
//         },
//       });
//     });

//     it("EXTRA CREDIT: Hashes password before saving user to DB.", async () => {
//       // Create some fake user data
//       const fakeUserData = {
//         username: faker.internet.userName(),
//         password: faker.internet.password(),
//       };

//       // Create the user through the API
//       const response = await request(app)
//         .post("/api/users/register")
//         .send(fakeUserData);

//       expectNotToBeError(response.body);

//       // Grab the user from the DB manually so we can
//       // get the hashed password and check it
//       const {
//         rows: [user],
//       } = await client.query(
//         `
//           SELECT *
//           FROM users
//           WHERE id = $1;
//         `,
//         [response.body.user.id]
//       );

//       const hashedPassword = user.password;

//       // The original password and the hashedPassword shouldn't be the same
//       expect(fakeUserData.password).not.toBe(hashedPassword);
//       // Bcrypt.compare should return true.
//       expect(await bcrypt.compare(fakeUserData.password, hashedPassword)).toBe(
//         true
//       );
//     });

//     it("Throws errors for duplicate username", async () => {
//       // Create a fake user in the DB
//       const { fakeUser: firstUser } = await createFakeUserWithToken();
//       // Now try to create a user with the same username
//       const secondUserData = {
//         username: firstUser.username,
//         password: faker.internet.password(),
//       };

//       const response = await request(app)
//         .post("/api/users/register")
//         .send(secondUserData);

//       expectToBeError(response.body);

//       expectToHaveErrorMessage(
//         response.body,
//         UserTakenError(firstUser.username)
//       );
//     });

//     it("returns error if password is less than 8 characters.", async () => {
//       // Create some user data with a password with 7 characters
//       const newUserShortPassword = {
//         username: faker.internet.userName(),
//         password: faker.internet.password(7),
//       };

//       const response = await request(app)
//         .post("/api/users/register")
//         .send(newUserShortPassword);

//       expectToHaveErrorMessage(response.body, PasswordTooShortError());
//     });
//   });

//   describe("POST /api/users/login", () => {
//     it("Logs in the user. Requires username and password, and verifies that hashed login password matches the saved hashed password.", async () => {
//       // Create some fake user data
//       const userData = {
//         username: faker.internet.userName(),
//         password: faker.internet.password(),
//       };
//       // Create the user in the DB
//       await createUser(userData);
//       // Login the user
//       const response = await request(app)
//         .post("/api/users/login")
//         .send(userData);

//       expectNotToBeError(response.body);

//       expect(response.body).toEqual(
//         objectContaining({
//           message: "you're logged in!",
//         })
//       );
//     });

//     it("Logs in the user and returns the user back to us", async () => {
//       // Create some fake user data
//       const userData = {
//         username: faker.internet.userName(),
//         password: faker.internet.password(),
//       };
//       // Create the user in the DB
//       const user = await createUser(userData);
//       // Login the user
//       const response = await request(app)
//         .post("/api/users/login")
//         .send(userData);

//       expectNotToBeError(response.body);

//       // The body should contain the user info
//       expect(response.body).toMatchObject({
//         user,
//       });
//     });

//     it("Returns a JSON Web Token. Stores the id and username in the token.", async () => {
//       const userData = {
//         username: faker.internet.userName(),
//         password: faker.internet.password(),
//       };
//       // Create the user in the DB
//       const user = await createUser(userData);
//       // Login the user
//       const { body } = await request(app)
//         .post("/api/users/login")
//         .send(userData);

//       expectNotToBeError(body);

//       expect(body).toMatchObject({
//         token: expect.any(String),
//       });
//       // Verify the JWT token
//       const parsedToken = jwt.verify(body.token, JWT_SECRET);
//       // The token should return an object just like the user
//       expect(parsedToken).toMatchObject(user);
//     });
//   });

//   describe("GET /api/users/me", () => {
//     it("sends back users data if valid token is supplied in header", async () => {
//       const { fakeUser, token } = await createFakeUserWithToken();

//       const response = await request(app)
//         .get("/api/users/me")
//         .set("Authorization", `Bearer ${token}`);

//       expectNotToBeError(response.body);

//       expect(response.body).toEqual(objectContaining(fakeUser));
//     });

//     it("rejects requests with no valid token", async () => {
//       const response = await request(app).get("/api/users/me");

//       expect(response.status).toBe(401);

//       expectToHaveErrorMessage(response.body, UnauthorizedError());
//     });
//   });

//   describe("GET /api/users/:username/routines", () => {
//     it("Gets a list of public routines for a particular user.", async () => {
//       // Create a fake user with a bunch of routines associated
//       const { fakeUser, token } = await createFakeUserWithRoutinesAndActivities(
//         "Greg"
//       );
//       // Create a second user to check against
//       const sean = await createFakeUserWithRoutinesAndActivities("Sean");

//       const response = await request(app)
//         .get(`/api/users/${sean.fakeUser.username}/routines`)
//         .set("Authorization", `Bearer ${token}`);

//       expectNotToBeError(response.body);

//       // Get the routines from the DB
//       const routinesFromDB = await getPublicRoutinesByUser(sean.fakeUser);

//       expect(response.body).toEqual([...routinesFromDB]);
//     });

//     it("gets a list of all routines for the logged in user", async () => {
//       const { fakeUser, token } = await createFakeUserWithRoutinesAndActivities(
//         "Angela"
//       );
//       const response = await request(app)
//         .get(`/api/users/${fakeUser.username}/routines`)
//         .set("Authorization", `Bearer ${token}`);

//       expectNotToBeError(response.body);

//       const routinesFromDB = await getAllRoutinesByUser(fakeUser);

//       expect(response.body).toEqual([...routinesFromDB]);
//     });
//   });
// });

/* 

DO NOT CHANGE THIS FILE

*/
require("dotenv").config();
const bcrypt = require("bcrypt");
const faker = require("faker");
const client = require("../../db/client");
const {
  getUserById,
  createUser,
  getUser,
} = require("../../db");
const { createFakeUser } = require("../helpers");

describe("DB Users", () => {


  describe("createUser({ username, password })", () => {

    it("Creates the user", async () => {
      const fakeUserData = {
        username: "Horace",
        password: faker.internet.password(),
      };

      const user = await createUser(fakeUserData);

      const queriedUser = await getUserById(user.id);

      expect(user.username).toBe(fakeUserData.username);
      expect(queriedUser.username).toBe(fakeUserData.username);
    });

    it("EXTRA CREDIT: Does not store plaintext password in the database", async () => {
      const fakeUserData = {
        username: "Harry",
        password: faker.internet.password(),
      };
      const user = await createUser(fakeUserData);
      const queriedUser = await getUserById(user.id);
      expect(queriedUser.password).not.toBe(fakeUserData.password);
    });

    it("EXTRA CREDIT: Hashes the password (salted 10 times) before storing it to the database", async () => {
      const fakeUserData = {
        username: "Nicky",
        password: faker.internet.password(),
      };
      const user = await createUser(fakeUserData);

      const { rows: [queriedUser] } = await client.query(
        `
        SELECT * from users
        WHERE id = $1
        `,
        [user.id]
      );

      const hashedVersion = await bcrypt.compare(
        fakeUserData.password,
        queriedUser.password
      );
      expect(hashedVersion).toBe(true);
    });

    it("Does NOT return the password", async () => {
      const fakeUserData = {
        username: faker.internet.userName(),
        password: faker.internet.password(),
      };
      const user = await createUser(fakeUserData);
      expect(user.password).toBeFalsy();
    });

  });

  describe("getUser({ username, password })", () => {

    it("returns the user when the password verifies", async () => {
      const fakeUserData = {
        username: "Nicole",
        password: faker.internet.password(),
      };
      await createUser(fakeUserData);

      const user = await getUser(fakeUserData);
      expect(user).toBeTruthy();
      expect(user.username).toBe(fakeUserData.username);
    });

    it("Does not return the user if the password doesn't verify", async () => {
      const fakeUserData = {
        username: "Issac",
        password: faker.internet.password(),
      };
      await createUser(fakeUserData);

      const user = await getUser({
        username: "Issac",
        password: "Bad Password"
      });

      expect(user).toBeFalsy();
    });

    it("Does NOT return the password", async () => {
      const fakeUserData = {
        username: "Michael",
        password: faker.internet.password(),
      };
      await createUser(fakeUserData);
      const user = await getUser(fakeUserData);
      expect(user.password).toBeFalsy();
    });

  });
  describe("getUserById", () => {

    it("Gets a user based on the user Id", async () => {
      const fakeUser = await createFakeUser("Jacob");
      const user = await getUserById(fakeUser.id);
      expect(user).toBeTruthy();
      expect(user.id).toBe(fakeUser.id);
    });

    it("does not return the password", async () => {
      const fakeUser = await createFakeUser("Jonathan");
      const user = await getUserById(fakeUser.id);
      expect(user.password).toBeFalsy();
    });

  });
});
