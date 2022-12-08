import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import UserDao from "../../src/data/UserDao.js";
import { faker } from "@faker-js/faker";
import User from "../../src/model/User.js";
import * as db from "../../src/data/db.js";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import { verifyPassword } from "../../src/util/password.js";
import { UserRole } from "../../src/model/UserRole.js";

dotenv.config();

const userDao = new UserDao();

describe("Test UserDao", () => {
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
      const role = Math.random() > 0.5 ? UserRole.Student : UserRole.Instructor;
      const user = await User.create({ name, email, password, role });
      users.push(user);
    }
  });

  it("test create()", async () => {
    const name = faker.name.fullName();
    const email = faker.internet.email();
    const password = faker.internet.password(6);
    const role = Math.random() > 0.5 ? UserRole.Student : UserRole.Instructor;
    const _user = await userDao.create({ name, email, password, role });
    expect(_user.name).toBe(name);
    expect(_user.email).toBe(email);
    expect(verifyPassword(password, _user.password)).toBe(true);
    expect(_user.id).toBeDefined();
    expect(_user.role).toBe(role);
  });

  it("test create() without given role", async () => {
    const name = faker.name.fullName();
    const email = faker.internet.email();
    const password = faker.internet.password(6);
    const _user = await userDao.create({ name, email, password });
    expect(_user.name).toBe(name);
    expect(_user.email).toBe(email);
    expect(verifyPassword(password, _user.password)).toBe(true);
    expect(_user.id).toBeDefined();
    expect(_user.role).toBe(UserRole.Student);
  });

  describe("test create() throws error", () => {
    it("empty name", async () => {
      try {
        const name = "";
        const email = faker.internet.email();
        const password = faker.internet.password(6);
        await userDao.create({ name, email, password });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("null name", async () => {
      try {
        const name = null;
        const email = faker.internet.email();
        const password = faker.internet.password(6);
        await userDao.create({ name, email, password });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("undefined name", async () => {
      try {
        const name = undefined;
        const email = faker.internet.email();
        const password = faker.internet.password(6);
        await userDao.create({ name, email, password });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("empty email", async () => {
      try {
        const name = faker.name.fullName();
        const email = "";
        const password = faker.internet.password(6);
        await userDao.create({ name, email, password });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("null email", async () => {
      try {
        const name = faker.name.fullName();
        const email = null;
        const password = faker.internet.password(6);
        await userDao.create({ name, email, password });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("undefined email", async () => {
      try {
        const name = faker.name.fullName();
        const email = undefined;
        const password = faker.internet.password(6);
        await userDao.create({ name, email, password });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("invalid email", async () => {
      try {
        const name = faker.name.fullName();
        const email = faker.lorem.sentence();
        const password = faker.internet.password(6);
        await userDao.create({ name, email, password });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("test email is not unique", async () => {
      try {
        let name = faker.name.fullName();
        const email = faker.lorem.sentence();
        let password = faker.internet.password(6);
        await userDao.create({ name, email, password });

        name = faker.name.fullName();
        password = faker.internet.password(6);
        await User.create({ name, email, password });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("empty password", async () => {
      try {
        const name = faker.name.fullName();
        const email = faker.internet.email();
        const password = "";
        await userDao.create({ name, email, password });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("null password", async () => {
      try {
        const name = faker.name.fullName();
        const email = faker.internet.email();
        const password = null;
        await userDao.create({ name, email, password });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("undefined password", async () => {
      try {
        const name = faker.name.fullName();
        const email = faker.internet.email();
        const password = undefined;
        await userDao.create({ name, email, password });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("short password", async () => {
      try {
        const name = faker.name.fullName();
        const email = faker.internet.email();
        const password = faker.internet.password(5);
        await userDao.create({ name, email, password });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("test role is null", async () => {
      try {
        const name = faker.name.fullName();
        const email = faker.internet.email();
        const password = faker.internet.password(6);
        const role = null;
        await userDao.create({ name, email, password, role });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("test role is undefined", async () => {
      try {
        const name = faker.name.fullName();
        const email = faker.internet.email();
        const password = faker.internet.password(6);
        const role = undefined;
        await userDao.create({ name, email, password, role });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("test role is empty", async () => {
      try {
        const name = faker.name.fullName();
        const email = faker.internet.email();
        const password = faker.internet.password(6);
        const role = "";
        await userDao.create({ name, email, password, role });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("test role is invalid", async () => {
      try {
        const name = faker.name.fullName();
        const email = faker.internet.email();
        const password = faker.internet.password(6);
        const role = faker.random.word();
        await userDao.create({ name, email, password, role });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });
  });

  it("test readAll()", async () => {
    const users = await userDao.readAll({});
    expect(users.length).toBe(users.length);
  });

  it("test readAll() given a name", async () => {
    const index = Math.floor(Math.random() * numUsers);
    const user = users[index];
    const _users = await userDao.readAll({ name: user.name });
    expect(_users.length).toBeGreaterThanOrEqual(1);
  });

  it("test readAll() given an email", async () => {
    const index = Math.floor(Math.random() * numUsers);
    const user = users[index];
    const _users = await userDao.readAll({ email: user.email });
    expect(_users.length).toBeGreaterThanOrEqual(1);
  });

  it("test readAll() given a role", async () => {
    for (let role of Object.values(UserRole)) {
      const count = users.reduce((total, user) => {
        if (user.role === role) {
          total += 1;
        }
        return total;
      }, 0);

      const _users = await userDao.readAll({ role });
      expect(_users.length).toBeGreaterThanOrEqual(count);
    }
  });

  it("test read() given valid ID", async () => {
    const index = Math.floor(Math.random() * numUsers);
    const user = users[index];
    const _user = await userDao.read(user.id);
    expect(_user.name).toBe(user.name);
    expect(_user.email).toBe(user.email);
    expect(_user.password).toBe(user.password);
    expect(_user.id).toBe(user.id);
    expect(_user.role).toBe(user.role);
  });

  it("test read() given invalid ID", async () => {
    try {
      await userDao.read("invalid");
    } catch (err) {
      expect(err.status).toBe(400);
    }
  });

  it("test read() given valid but non-existing ID", async () => {
    try {
      await userDao.read(mongoose.Types.ObjectId().toString());
    } catch (err) {
      expect(err.status).toBe(404);
    }
  });

  it("test update() given valid ID", async () => {
    const index = Math.floor(Math.random() * numUsers);
    const user = users[index];
    const name = faker.name.fullName();
    const email = faker.internet.email();
    const password = faker.internet.password(6);
    const role = Math.random() > 0.5 ? UserRole.Student : UserRole.Instructor;
    const _user = await userDao.update({
      id: user.id,
      name,
      email,
      password,
      role,
    });

    expect(_user.name).toBe(name);
    expect(_user.email).toBe(email);
    expect(verifyPassword(password, _user.password)).toBe(true);
    expect(_user.id).toBe(user.id);
    expect(_user.role).toBe(role);
  });

  it("test update() given invalid ID", async () => {
    try {
      await userDao.update({ id: "invalid" });
    } catch (err) {
      expect(err.status).toBe(400);
    }
  });

  it("test update() given valid but non-existing ID", async () => {
    try {
      await userDao.update({ id: mongoose.Types.ObjectId().toString() });
    } catch (err) {
      expect(err.status).toBe(404);
    }
  });

  it("test update() given invalid name", async () => {
    try {
      const index = Math.floor(Math.random() * numUsers);
      const user = users[index];
      const name = "";
      await userDao.update({
        id: user.id,
        name,
      });
    } catch (err) {
      expect(err.status).toBe(400);
    }
  });

  it("test update() given invalid email", async () => {
    try {
      const index = Math.floor(Math.random() * numUsers);
      const user = users[index];
      const email = faker.name.fullName();
      await userDao.update({
        id: user.id,
        email,
      });
    } catch (err) {
      expect(err.status).toBe(400);
    }
  });

  it("test update() given duplicate email", async () => {
    try {
      const index1 = Math.floor(Math.random() * numUsers);
      const user1 = users[index1];
      const index2 = (index1 + 1) % numUsers;
      const user2 = users[index2];
      await userDao.update({
        id: user1.id,
        email: user2.email,
      });
    } catch (err) {
      expect(err.status).toBe(400);
    }
  });

  it("test update() given invalid password", async () => {
    try {
      const index = Math.floor(Math.random() * numUsers);
      const user = users[index];
      const password = faker.internet.password(5);
      await userDao.update({
        id: user.id,
        password,
      });
    } catch (err) {
      expect(err.status).toBe(400);
    }
  });

  it("test update() given invalid role", async () => {
    try {
      const index = Math.floor(Math.random() * numUsers);
      const user = users[index];
      const role = faker.random.word();
      await userDao.update({
        id: user.id,
        role,
      });
    } catch (err) {
      expect(err.status).toBe(400);
    }
  });

  it("test delete() given valid ID", async () => {
    const index = Math.floor(Math.random() * numUsers);
    const user = users[index];
    const _user = await userDao.delete(user.id);
    expect(_user.name).toBe(user.name);
    expect(_user.email).toBe(user.email);
    expect(_user.password).toBe(user.password);
    expect(_user.id).toBe(user.id);
    expect(_user.role).toBe(user.role);
  });

  it("test delete() given invalid ID", async () => {
    try {
      await userDao.delete("invalid");
    } catch (err) {
      expect(err.status).toBe(400);
    }
  });

  it("test delete() given valid but non-existing ID", async () => {
    try {
      await userDao.delete(mongoose.Types.ObjectId().toString());
    } catch (err) {
      expect(err.status).toBe(404);
    }
  });

  afterAll(async () => {
    await userDao.deleteAll();
  });
});
