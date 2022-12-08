import express from "express";
import UserDao from "../data/UserDao.js";
import { factory } from "../util/debug.js";

const debug = factory(import.meta.url);
const router = express.Router();
export const userDao = new UserDao();
const endpoint = "/users";

// pre: user is a Mongoose object
const hidePassword = (user) => {
  const { password, __v, ...rest } = user._doc;
  return rest;
};

router.get(`${endpoint}`, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);

  try {
    const { name, email } = req.query;
    const users = await userDao.readAll({ name, email });
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully retrieved ${users.length} users!`,
      data: users.map((user) => hidePassword(user)),
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

router.get(`${endpoint}/:id`, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { id } = req.params;
    const user = await userDao.read(id);
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully retrieved the following user!`,
      data: hidePassword(user),
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

router.post(`${endpoint}`, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { name, email, password } = req.body;
    const user = await userDao.create({ name, email, password });
    debug(`Preparing the response payload...`);
    res.status(201).json({
      status: 201,
      message: `Successfully created the following user!`,
      data: hidePassword(user),
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

router.put(`${endpoint}/:id`, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;
    const user = await userDao.update({ id, name, email, password });
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully updated the following bookmark!`,
      data: hidePassword(user),
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

router.delete(`${endpoint}/:id`, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    debug(`Read ID received as request parameter...`);
    const { id } = req.params;
    const user = await userDao.delete(id);
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully deleted the following user!`,
      data: hidePassword(user),
    });
    debug(`Done with ${req.method} ${req.path} `);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

export default router;
