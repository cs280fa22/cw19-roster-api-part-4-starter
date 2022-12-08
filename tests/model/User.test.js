import { describe, beforeAll, afterAll, expect, it } from "vitest";
import User from "../../src/model/User.js";
import { faker } from "@faker-js/faker";
import * as db from "../../src/data/db.js";
import * as dotenv from "dotenv";
import { UserRole } from "../../src/model/UserRole.js";

dotenv.config();

describe("Test User Schema & Model", () => {
  beforeAll(async () => {
    db.connect(process.env.DB_TEST_URI);
    await User.deleteMany({});
  });

  it("test create user", async () => {
    const name = faker.name.fullName();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const role = Math.random() > 0.5 ? UserRole.Student : UserRole.Instructor;
    const user = await User.create({ name, email, password, role });
    expect(user.name).toBe(name);
    expect(user.email).toBe(email);
    expect(user.id).toBeDefined();
    expect(user.password).toBe(password);
    expect(user.role).toBe(role);
  });

  it("test create user with default role", async () => {
    const name = faker.name.fullName();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const user = await User.create({ name, email, password });
    expect(user.name).toBe(name);
    expect(user.email).toBe(email);
    expect(user.id).toBeDefined();
    expect(user.password).toBe(password);
    expect(user.role).toBe(UserRole.Student);
  });

  describe("test name is required", () => {
    it("test name is null", async () => {
      try {
        const name = null;
        const password = faker.internet.password();
        const email = faker.internet.email();
        const role =
          Math.random() > 0.5 ? UserRole.Student : UserRole.Instructor;
        await User.create({ name, email, password, role });
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    it("test name is undefined", async () => {
      try {
        const name = undefined;
        const password = faker.internet.password();
        const email = faker.internet.email();
        const role =
          Math.random() > 0.5 ? UserRole.Student : UserRole.Instructor;
        await User.create({ name, email, password, role });
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    it("test name is empty", async () => {
      try {
        const name = "";
        const password = faker.internet.password();
        const email = faker.internet.email();
        const role =
          Math.random() > 0.5 ? UserRole.Student : UserRole.Instructor;
        await User.create({ name, email, password, role });
      } catch (err) {
        expect(err).toBeDefined();
      }
    });
  });

  describe("test email is required", () => {
    it("test email is null", async () => {
      try {
        const name = faker.name.fullName();
        const email = null;
        const password = faker.internet.password();
        const role =
          Math.random() > 0.5 ? UserRole.Student : UserRole.Instructor;
        await User.create({ name, email, password, role });
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    it("test email is undefined", async () => {
      try {
        const name = faker.name.fullName();
        const email = undefined;
        const password = faker.internet.password();
        const role =
          Math.random() > 0.5 ? UserRole.Student : UserRole.Instructor;
        await User.create({ name, email, password, role });
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    it("test email is empty", async () => {
      try {
        const name = faker.name.fullName();
        const email = "";
        const password = faker.internet.password();
        const role =
          Math.random() > 0.5 ? UserRole.Student : UserRole.Instructor;
        await User.create({ name, email, password, role });
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    it("test email is invalid", async () => {
      try {
        const name = faker.name.fullName();
        const email = faker.lorem.sentence();
        const password = faker.internet.password();
        const role =
          Math.random() > 0.5 ? UserRole.Student : UserRole.Instructor;
        await User.create({ name, email, password, role });
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    it("test email is not unique", async () => {
      try {
        let name = faker.name.fullName();
        const email = faker.internet.email();
        const password = faker.internet.password();
        const role =
          Math.random() > 0.5 ? UserRole.Student : UserRole.Instructor;
        await User.create({ name, email, password, role });

        name = faker.name.fullName();
        await User.create({ name, email, password, role });
      } catch (err) {
        expect(err).toBeDefined();
      }
    });
  });

  describe("test password is required", () => {
    it("test password is null", async () => {
      try {
        const name = faker.name.fullName();
        const email = faker.internet.email();
        const password = null;
        const role =
          Math.random() > 0.5 ? UserRole.Student : UserRole.Instructor;
        await User.create({ name, email, password, role });
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    it("test password is undefined", async () => {
      try {
        const name = faker.name.fullName();
        const email = faker.internet.email();
        const password = undefined;
        const role =
          Math.random() > 0.5 ? UserRole.Student : UserRole.Instructor;
        await User.create({ name, email, password, role });
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    it("test password is empty", async () => {
      try {
        const name = faker.name.fullName();
        const email = faker.internet.email();
        const password = "";
        const role =
          Math.random() > 0.5 ? UserRole.Student : UserRole.Instructor;
        await User.create({ name, email, password, role });
      } catch (err) {
        expect(err).toBeDefined();
      }
    });
  });

  describe("test role is required", () => {
    it("test role is null", async () => {
      try {
        const name = faker.name.fullName();
        const email = faker.internet.email();
        const password = faker.internet.password();
        const role = null;
        await User.create({ name, email, password, role });
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    it("test role is undefined", async () => {
      try {
        const name = faker.name.fullName();
        const email = faker.internet.email();
        const password = faker.internet.password();
        const role = undefined;
        await User.create({ name, email, password, role });
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    it("test role is empty", async () => {
      try {
        const name = faker.name.fullName();
        const email = faker.internet.email();
        const password = faker.internet.password();
        const role = "";
        await User.create({ name, email, password, role });
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    it("test role is invalid", async () => {
      try {
        const name = faker.name.fullName();
        const email = faker.internet.email();
        const password = faker.internet.password();
        const role = faker.random.word();
        await User.create({ name, email, password, role });
      } catch (err) {
        expect(err).toBeDefined();
      }
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
  });
});
