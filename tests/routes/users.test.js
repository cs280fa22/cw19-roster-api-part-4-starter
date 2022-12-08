import { describe, it, expect, beforeEach, afterAll, beforeAll } from "vitest";
import app from "../../src/index.js";
import supertest from "supertest";
import { faker } from "@faker-js/faker";
import { userDao } from "../../src/routes/users.js";
import * as db from "../../src/data/db.js";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import { UserRole } from "../../src/model/UserRole.js";
import { createToken } from "../../src/util/token.js";

dotenv.config();
const endpoint = "/users";
const request = new supertest(app);

describe(`Test ${endpoint}`, () => {
  const numUsers = 5;
  let users;

  beforeAll(async () => {
    db.connect(process.env.DB_TEST_URI);
    await userDao.deleteAll();
  });

  beforeEach(async () => {
    await userDao.deleteAll();
    users = [];
    for (let index = 0; index < numUsers; index++) {
      const name = faker.name.fullName();
      const email = faker.internet.email();
      const password = faker.internet.password(6);
      const role =
        index > numUsers / 2 ? UserRole.Student : UserRole.Instructor;
      const user = await userDao.create({ name, email, password, role });
      user.token = createToken({ user: { id: user.id, role: user.role } });
      user.expiredToken = createToken({
        user: { id: user.id, role: user.role },
        expiresIn: "0",
      });
      users.push(user);
    }
  });

  describe("GET request", () => {
    it("Respond 401 when no auth token", async () => {
      const response = await request.get(endpoint);
      expect(response.status).toBe(401);
    });

    it("Respond 401 when expired auth token", async () => {
      const response = await request
        .get(endpoint)
        .set(
          "Authorization",
          "bearer " +
            users.find((u) => u.role === UserRole.Instructor).expiredToken
        );
      expect(response.status).toBe(401);
    });

    it("Respond 403", async () => {
      const response = await request
        .get(endpoint)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === UserRole.Student).token
        );
      expect(response.status).toBe(403);
    });

    it("Respond 200", async () => {
      const response = await request
        .get(endpoint)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === UserRole.Instructor).token
        );
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(numUsers);
    });

    it("Respond 200 searching for given name", async () => {
      const index = Math.floor(Math.random() * numUsers);
      const user = users[index];
      const response = await request
        .get(`${endpoint}?name=${user.name}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === UserRole.Instructor).token
        );
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it("Respond 200 searching for given email", async () => {
      const index = Math.floor(Math.random() * numUsers);
      const user = users[index];
      const response = await request
        .get(`${endpoint}?email=${user.email}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === UserRole.Instructor).token
        );
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it("Respond 200 searching for given role", async () => {
      for (let role of Object.values(UserRole)) {
        const count = users.reduce((total, user) => {
          if (user.role === role) {
            total += 1;
          }
          return total;
        }, 0);

        const response = await request
          .get(`${endpoint}?role=${role}`)
          .set(
            "Authorization",
            "bearer " + users.find((u) => u.role === UserRole.Instructor).token
          );
        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(count);
      }
    });
  });

  describe("POST request", () => {
    it("Respond 201", async () => {
      const name = faker.name.fullName();
      const email = faker.internet.email();
      const password = faker.internet.password(6);
      const role = Math.random() > 0.5 ? UserRole.Student : UserRole.Instructor;
      const response = await request.post(endpoint).send({
        name,
        email,
        password,
        role,
      });
      expect(response.status).toBe(201);
      expect(response.body.data._id).toBeDefined();
      expect(response.body.data.name).toBe(name);
      expect(response.body.data.email).toBe(email);
      expect(response.body.data.password).toBeUndefined();
      expect(response.body.data.role).toBe(role);
    });

    it("Respond 201 (role not provided)", async () => {
      const name = faker.name.fullName();
      const email = faker.internet.email();
      const password = faker.internet.password(6);
      const response = await request.post(endpoint).send({
        name,
        email,
        password,
      });
      expect(response.status).toBe(201);
      expect(response.body.data._id).toBeDefined();
      expect(response.body.data.name).toBe(name);
      expect(response.body.data.email).toBe(email);
      expect(response.body.data.password).toBeUndefined();
      expect(response.body.data.role).toBe(UserRole.Student);
    });

    describe("Respond 400", () => {
      it("Null name", async () => {
        const name = null;
        const email = faker.internet.email();
        const password = faker.internet.password(6);
        const response = await request.post(endpoint).send({
          name,
          email,
          password,
        });
        expect(response.status).toBe(400);
      });

      it("Undefined name", async () => {
        const name = undefined;
        const email = faker.internet.email();
        const password = faker.internet.password(6);
        const response = await request.post(endpoint).send({
          name,
          email,
          password,
        });
        expect(response.status).toBe(400);
      });

      it("Empty name", async () => {
        const name = "";
        const email = faker.internet.email();
        const password = faker.internet.password(6);
        const response = await request.post(endpoint).send({
          name,
          email,
          password,
        });
        expect(response.status).toBe(400);
      });

      it("Null email", async () => {
        const name = faker.name.fullName();
        const email = null;
        const password = faker.internet.password(6);
        const response = await request.post(endpoint).send({
          name,
          email,
          password,
        });
        expect(response.status).toBe(400);
      });

      it("Undefined email", async () => {
        const name = faker.name.fullName();
        const email = undefined;
        const password = faker.internet.password(6);
        const response = await request.post(endpoint).send({
          name,
          email,
          password,
        });
        expect(response.status).toBe(400);
      });

      it("Empty email", async () => {
        const name = faker.name.fullName();
        const email = "";
        const password = faker.internet.password(6);
        const response = await request.post(endpoint).send({
          name,
          email,
          password,
        });
        expect(response.status).toBe(400);
      });

      it("Invalid email", async () => {
        const name = faker.name.fullName();
        const email = faker.lorem.sentence();
        const password = faker.internet.password(6);
        const response = await request.post(endpoint).send({
          name,
          email,
          password,
        });
        expect(response.status).toBe(400);
      });

      it("Duplicate email", async () => {
        let name = faker.name.fullName();
        const email = faker.internet.email();
        let password = faker.internet.password(6);
        await request.post(endpoint).send({
          name,
          email,
          password,
        });

        name = faker.name.fullName();
        password = faker.internet.password(6);
        const response = await request.post(endpoint).send({
          name,
          email,
          password,
        });
        expect(response.status).toBe(400);
      });

      it("Null password", async () => {
        const name = faker.name.fullName();
        const email = faker.internet.email();
        const password = null;
        const response = await request.post(endpoint).send({
          name,
          email,
          password,
        });
        expect(response.status).toBe(400);
      });

      it("Undefined password", async () => {
        const name = faker.name.fullName();
        const email = faker.internet.email();
        const password = undefined;
        const response = await request.post(endpoint).send({
          name,
          email,
          password,
        });
        expect(response.status).toBe(400);
      });

      it("Empty password", async () => {
        const name = faker.name.fullName();
        const email = faker.internet.email();
        const password = "";
        const response = await request.post(endpoint).send({
          name,
          email,
          password,
        });
        expect(response.status).toBe(400);
      });

      it("Short password", async () => {
        const name = faker.name.fullName();
        const email = faker.internet.email();
        const password = faker.internet.password(5);
        const response = await request.post(endpoint).send({
          name,
          email,
          password,
        });
        expect(response.status).toBe(400);
      });

      it("Null role", async () => {
        const name = faker.name.fullName();
        const email = faker.internet.email();
        const password = faker.internet.password(5);
        const role = null;
        const response = await request.post(endpoint).send({
          name,
          email,
          password,
          role,
        });
        expect(response.status).toBe(400);
      });

      it("Undefined role", async () => {
        const name = faker.name.fullName();
        const email = faker.internet.email();
        const password = faker.internet.password(5);
        const role = undefined;
        const response = await request.post(endpoint).send({
          name,
          email,
          password,
          role,
        });
        expect(response.status).toBe(400);
      });

      it("Empty role", async () => {
        const name = faker.name.fullName();
        const email = faker.internet.email();
        const password = faker.internet.password(5);
        const role = "";
        const response = await request.post(endpoint).send({
          name,
          email,
          password,
          role,
        });
        expect(response.status).toBe(400);
      });

      it("Invalid role", async () => {
        const name = faker.name.fullName();
        const email = faker.internet.email();
        const password = faker.internet.password(5);
        const role = faker.random.word();
        const response = await request.post(endpoint).send({
          name,
          email,
          password,
          role,
        });
        expect(response.status).toBe(400);
      });
    });
  });

  describe("GET request given ID", () => {
    it("Respond 401 when no auth token", async () => {
      const index = Math.floor(Math.random() * numUsers);
      const user = users[index];
      const response = await request.get(`${endpoint}/${user.id}`);
      expect(response.status).toBe(401);
    });

    it("Respond 401 when expired auth token", async () => {
      const index = Math.floor(Math.random() * numUsers);
      const user = users[index];
      const response = await request
        .get(`${endpoint}/${user.id}`)
        .set(
          "Authorization",
          "bearer " +
            users.find((u) => u.role === UserRole.Instructor).expiredToken
        );
      expect(response.status).toBe(401);
    });

    it("Respond 403", async () => {
      const instructors = users.filter((u) => u.role === UserRole.Instructor);
      const index = Math.floor(Math.random() * instructors.length);
      const user = instructors[index];
      const response = await request
        .get(`${endpoint}/${user.id}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === UserRole.Student).token
        );
      expect(response.status).toBe(403);
    });

    it("Respond 200 when instructor seeks any user", async () => {
      const index = Math.floor(Math.random() * numUsers);
      const user = users[index];
      const response = await request
        .get(`${endpoint}/${user.id}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === UserRole.Instructor).token
        );
      expect(response.status).toBe(200);
      expect(response.body.data._id).toBe(user.id);
      expect(response.body.data.name).toBe(user.name);
      expect(response.body.data.email).toBe(user.email);
      expect(response.body.data.password).toBeUndefined();
      expect(response.body.data.role).toBe(user.role);
    });

    it("Respond 200 when student seeks own user account", async () => {
      const students = users.filter((u) => u.role === UserRole.Student);
      const index = Math.floor(Math.random() * students.length);
      const user = students[index];
      const response = await request
        .get(`${endpoint}/${user.id}`)
        .set("Authorization", "bearer " + user.token);
      expect(response.status).toBe(200);
      expect(response.body.data._id).toBe(user.id);
      expect(response.body.data.name).toBe(user.name);
      expect(response.body.data.email).toBe(user.email);
      expect(response.body.data.password).toBeUndefined();
      expect(response.body.data.role).toBe(user.role);
    });

    it("Respond 400", async () => {
      const response = await request
        .get(`${endpoint}/invalid}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === UserRole.Instructor).token
        );
      expect(response.status).toBe(400);
    });

    it("Respond 404", async () => {
      const response = await request
        .get(`${endpoint}/${mongoose.Types.ObjectId().toString()}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === UserRole.Instructor).token
        );
      expect(response.status).toBe(404);
    });
  });

  describe("PUT request", () => {
    it("Respond 401 when no auth token", async () => {
      const index = Math.floor(Math.random() * numUsers);
      const user = users[index];
      const name = faker.name.fullName();
      const email = faker.internet.email();
      const password = faker.internet.password(6);
      const role = Math.random() > 0.5 ? UserRole.Student : UserRole.Instructor;
      const response = await request.put(`${endpoint}/${user.id}`).send({
        name,
        email,
        password,
        role,
      });
      expect(response.status).toBe(401);
    });

    it("Respond 401 when expired auth token", async () => {
      const index = Math.floor(Math.random() * numUsers);
      const user = users[index];
      const name = faker.name.fullName();
      const email = faker.internet.email();
      const password = faker.internet.password(6);
      const role = Math.random() > 0.5 ? UserRole.Student : UserRole.Instructor;
      const response = await request
        .put(`${endpoint}/${user.id}`)
        .send({
          name,
          email,
          password,
          role,
        })
        .set(
          "Authorization",
          "bearer " +
            users.find((u) => u.role === UserRole.Instructor).expiredToken
        );
      expect(response.status).toBe(401);
    });

    it("Respond 403", async () => {
      const instructors = users.filter((u) => u.role === UserRole.Instructor);
      const index = Math.floor(Math.random() * instructors.length);
      const user = instructors[index];
      const name = faker.name.fullName();
      const email = faker.internet.email();
      const password = faker.internet.password(6);
      const role = Math.random() > 0.5 ? UserRole.Student : UserRole.Instructor;
      const response = await request
        .put(`${endpoint}/${user.id}`)
        .send({
          name,
          email,
          password,
          role,
        })
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === UserRole.Student).token
        );
      expect(response.status).toBe(403);
    });

    it("Respond 200 when instructor updates a user", async () => {
      const index = Math.floor(Math.random() * numUsers);
      const user = users[index];
      const name = faker.name.fullName();
      const email = faker.internet.email();
      const password = faker.internet.password(6);
      const role = Math.random() > 0.5 ? UserRole.Student : UserRole.Instructor;
      const response = await request
        .put(`${endpoint}/${user.id}`)
        .send({
          name,
          email,
          password,
          role,
        })
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === UserRole.Instructor).token
        );
      expect(response.status).toBe(200);
      expect(response.body.data._id).toBe(user.id);
      expect(response.body.data.name).toBe(name);
      expect(response.body.data.email).toBe(email);
      expect(response.body.data.role).toBe(role);
      expect(response.body.data.password).toBeUndefined();
    });

    it("Respond 200 when student updates own user account", async () => {
      const students = users.filter((u) => u.role === UserRole.Student);
      const index = Math.floor(Math.random() * students.length);
      const user = students[index];
      const name = faker.name.fullName();
      const email = faker.internet.email();
      const password = faker.internet.password(6);
      const role = Math.random() > 0.5 ? UserRole.Student : UserRole.Instructor;
      const response = await request
        .put(`${endpoint}/${user.id}`)
        .send({
          name,
          email,
          password,
          role,
        })
        .set("Authorization", "bearer " + user.token);
      expect(response.status).toBe(200);
      expect(response.body.data._id).toBe(user.id);
      expect(response.body.data.name).toBe(name);
      expect(response.body.data.email).toBe(email);
      expect(response.body.data.role).toBe(role);
      expect(response.body.data.password).toBeUndefined();
    });

    describe("Respond 400", () => {
      it("Invalid ID", async () => {
        const response = await request
          .put(`${endpoint}/invalid}`)
          .set(
            "Authorization",
            "bearer " + users.find((u) => u.role === UserRole.Instructor).token
          );
        expect(response.status).toBe(400);
      });

      it("Invalid name", async () => {
        const index = Math.floor(Math.random() * numUsers);
        const user = users[index];
        const name = "";
        const email = faker.internet.email();
        const password = faker.internet.password(6);
        const response = await request
          .put(`${endpoint}/${user.id}`)
          .send({
            name,
            email,
            password,
          })
          .set(
            "Authorization",
            "bearer " + users.find((u) => u.role === UserRole.Instructor).token
          );
        expect(response.status).toBe(400);
      });

      it("Invalid email", async () => {
        const index = Math.floor(Math.random() * numUsers);
        const user = users[index];
        const name = faker.name.fullName();
        const email = "";
        const password = faker.internet.password(6);
        const response = await request
          .put(`${endpoint}/${user.id}`)
          .send({
            name,
            email,
            password,
          })
          .set(
            "Authorization",
            "bearer " + users.find((u) => u.role === UserRole.Instructor).token
          );
        expect(response.status).toBe(400);
      });
    });

    it("Invalid role", async () => {
      const index = Math.floor(Math.random() * numUsers);
      const user = users[index];
      const name = faker.name.fullName();
      const role = faker.random.word();
      const response = await request
        .put(`${endpoint}/${user.id}`)
        .send({
          name,
          role,
        })
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === UserRole.Instructor).token
        );
      expect(response.status).toBe(400);
    });

    it("Respond 404", async () => {
      const response = await request
        .put(`${endpoint}/${mongoose.Types.ObjectId().toString()}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === UserRole.Instructor).token
        );
      expect(response.status).toBe(404);
    });
  });

  describe("DELETE request", () => {
    it("Respond 401 when no auth token", async () => {
      const index = Math.floor(Math.random() * numUsers);
      const user = users[index];
      const response = await request.delete(`${endpoint}/${user.id}`);
      expect(response.status).toBe(401);
    });

    it("Respond 401 when expired auth token", async () => {
      const index = Math.floor(Math.random() * numUsers);
      const user = users[index];
      const response = await request
        .delete(`${endpoint}/${user.id}`)
        .set(
          "Authorization",
          "bearer " +
            users.find((u) => u.role === UserRole.Instructor).expiredToken
        );
      expect(response.status).toBe(401);
    });

    it("Respond 403", async () => {
      const instructors = users.filter((u) => u.role === UserRole.Instructor);
      const index = Math.floor(Math.random() * instructors.length);
      const user = instructors[index];
      const response = await request
        .delete(`${endpoint}/${user.id}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === UserRole.Student).token
        );
      expect(response.status).toBe(403);
    });

    it("Respond 200 when instructor deletes a user", async () => {
      const index = Math.floor(Math.random() * numUsers);
      const user = users[index];
      const response = await request
        .delete(`${endpoint}/${user.id}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === UserRole.Instructor).token
        );
      expect(response.status).toBe(200);
      expect(response.body.data._id).toBe(user.id);
      expect(response.body.data.name).toBe(user.name);
      expect(response.body.data.email).toBe(user.email);
      expect(response.body.data.role).toBe(user.role);
      expect(response.body.data.password).toBeUndefined();
    });

    it("Respond 200 when student delete own user account", async () => {
      const students = users.filter((u) => u.role === UserRole.Student);
      const index = Math.floor(Math.random() * students.length);
      const user = students[index];
      const response = await request
        .delete(`${endpoint}/${user.id}`)
        .set("Authorization", "bearer " + user.token);
      expect(response.status).toBe(200);
      expect(response.body.data._id).toBe(user.id);
      expect(response.body.data.name).toBe(user.name);
      expect(response.body.data.email).toBe(user.email);
      expect(response.body.data.role).toBe(user.role);
      expect(response.body.data.password).toBeUndefined();
    });

    it("Respond 400", async () => {
      const response = await request
        .delete(`${endpoint}/invalid}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === UserRole.Instructor).token
        );
      expect(response.status).toBe(400);
    });

    it("Respond 404", async () => {
      const response = await request
        .delete(`${endpoint}/${mongoose.Types.ObjectId().toString()}`)
        .set(
          "Authorization",
          "bearer " + users.find((u) => u.role === UserRole.Instructor).token
        );
      expect(response.status).toBe(404);
    });
  });

  afterAll(async () => {
    await userDao.deleteAll();
  });
});
