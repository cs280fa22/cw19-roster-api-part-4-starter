import User from "../model/User.js";
import ApiError from "../model/ApiError.js";
import { z } from "zod";
import mongoose from "mongoose";
import { factory } from "../util/debug.js";
import { hashPassword } from "../util/password.js";

const debug = factory(import.meta.url);

const validObjectId = z
  .string()
  .refine((id) => mongoose.isValidObjectId(id), "Invalid ID!");
const validName = z.string().min(1, "Missing name attribute!");
const validEmail = z.string().email("Invalid Email!");
const validPassword = z
  .string()
  .min(6, "Password should be at least 6 characters.");

class UserDao {
  // return the created user
  // throws ApiError when name or email is invalid
  async create({ name, email, password }) {
    debug("Validating the name..");
    let result = validName.safeParse(name);
    if (!result.success) {
      throw new ApiError(400, "Invalid Name!");
    }

    debug("Validating the email..");
    result = validEmail.safeParse(email);
    if (!result.success) {
      throw new ApiError(400, "Invalid Email!");
    }
    result = await this.readAll({ email });
    if (result.length > 0) {
      throw new ApiError(400, "Email already in use!");
    }

    debug("Validating the password..");
    result = validPassword.safeParse(password);
    if (!result.success) {
      throw new ApiError(400, "Password should be at least 6 characters.");
    }

    password = hashPassword(password);

    debug("Creating the user document..");
    const user = await User.create({ name, email, password });
    return user;
  }

  // return all users
  async readAll({ name, email }) {
    const filter = {};
    if (name) {
      filter.name = name;
    }

    if (email) {
      filter.email = email;
    }

    debug("Reading all user documents..");
    const users = await User.find(filter);
    return users;
  }

  // return the user with the given id
  // throws ApiError if id is invalid or resource does not exist in our database
  async read(id) {
    debug("Validating the document id..");
    const result = validObjectId.safeParse(id);
    if (!result.success) {
      throw new ApiError(400, "Invalid ID!");
    }

    debug("Reading the user document..");
    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, "Resource not found!");
    }

    return user;
  }

  // return the updated user
  // throws ApiError if id is invalid or resource does not exist in our database
  async update({ id, name, email, password }) {
    debug("Validating the document id..");
    let result = validObjectId.safeParse(id);
    if (!result.success) {
      throw new ApiError(400, "Invalid ID!");
    }

    if (name !== undefined) {
      debug("Validating the name..");
      result = validName.safeParse(name);
      if (!result.success) {
        throw new ApiError(400, "Invalid Name!");
      }
    }

    if (email !== undefined) {
      debug("Validating the email..");
      result = validEmail.safeParse(email);
      if (!result.success) {
        throw new ApiError(400, "Invalid Email!");
      }

      result = await this.readAll({ email });
      for (let user in result) {
        if (user.id !== id) {
          throw new ApiError(400, "Email already in use!");
        }
      }
    }

    if (password !== undefined) {
      debug("Validating the password..");
      result = validPassword.safeParse(password);
      if (!result.success) {
        throw new ApiError(400, "Invalid Password!");
      }

      password = hashPassword(password);
    }

    debug("Updating the user document..");
    const user = await User.findByIdAndUpdate(
      id,
      { name, email, password },
      { new: true, runValidators: true }
    );
    if (!user) {
      throw new ApiError(404, "Resource not found!");
    }

    return user;
  }

  // return the deleted user
  // throws ApiError if id is invalid or resource does not exist
  async delete(id) {
    debug("Validating the document id..");
    const result = validObjectId.safeParse(id);
    if (!result.success) {
      throw new ApiError(400, "Invalid ID!");
    }

    debug("Deleting the user document..");
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new ApiError(404, "Resource not found!");
    }

    return user;
  }

  async deleteAll() {
    debug("Deleting all teeny url documents..");
    await User.deleteMany({});
  }
}

export default UserDao;
