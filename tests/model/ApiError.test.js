import { expect, test } from "vitest";
import ApiError from "../../src/model/ApiError.js";
import { faker } from "@faker-js/faker";

test("test ApiError", () => {
  const message = faker.lorem.sentence();
  const status = faker.datatype.number();
  const error = new ApiError(status, message);
  expect(error.message).toBe(message);
  expect(error.status).toBe(status);
});
