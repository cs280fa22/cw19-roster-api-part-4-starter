import { test, expect } from "vitest";
import app from "../src/index.js";
import supertest from "supertest";

const request = new supertest(app);

test("Test API / endpoint", async () => {
  const response = await request.get("/");
  expect(response.status).toBe(200);
});
