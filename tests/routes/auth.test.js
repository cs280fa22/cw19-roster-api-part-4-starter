import { describe, it, expect, beforeEach, afterAll, beforeAll } from "vitest";
import app from "../../src/index.js";
import supertest from "supertest";
import { faker } from "@faker-js/faker";
import { userDao } from "../../src/routes/users.js";
import { decodeToken } from "../../src/util/token.js";
import * as db from "../../src/data/db.js";
import * as dotenv from "dotenv";
import { UserRole } from "../../src/model/UserRole.js";

dotenv.config();
const endpoint = "/login";
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
      const password = email;
      const role = Math.random() > 0.5 ? UserRole.Student : UserRole.Instructor;
      const user = await userDao.create({ name, email, password, role });
      users.push(user);
    }
  });

  it("Respond 201", async () => {
    const index = Math.floor(Math.random() * numUsers);
    const user = users[index];
    const response = await request.post(endpoint).send({
      email: user.email,
      password: user.email,
    });
    expect(response.status).toBe(201);
    expect(response.body.token).toBeDefined();
    expect(response.body.data.name).toBe(user.name);
    expect(response.body.data.email).toBe(user.email);
    const { id, role } = decodeToken(response.body.token);
    expect(id).toBe(user.id);
    expect(role).toBe(user.role);
  });

  it("Respond 400 missing email", async () => {
    const index = Math.floor(Math.random() * numUsers);
    const user = users[index];
    const response = await request.post(endpoint).send({
      password: user.email,
    });
    expect(response.status).toBe(400);
  });

  it("Respond 400 missing password", async () => {
    const index = Math.floor(Math.random() * numUsers);
    const user = users[index];
    const response = await request.post(endpoint).send({
      email: user.email,
    });
    expect(response.status).toBe(400);
  });

  it("Respond 403 incorrect email", async () => {
    const index = Math.floor(Math.random() * numUsers);
    const user = users[index];
    const response = await request.post(endpoint).send({
      email: faker.internet.email(),
      password: user.email,
    });
    expect(response.status).toBe(403);
  });

  it("Respond 403 incorrect password", async () => {
    const index = Math.floor(Math.random() * numUsers);
    const user = users[index];
    const response = await request.post(endpoint).send({
      email: user.email,
      password: faker.internet.password(),
    });
    expect(response.status).toBe(403);
  });

  afterAll(async () => {
    await userDao.deleteAll();
  });
});
