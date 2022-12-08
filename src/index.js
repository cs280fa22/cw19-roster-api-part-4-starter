import express from "express";
import urls from "./routes/users.js";
import auth from "./routes/auth.js";
import cors from "cors";
import helmet from "helmet";
import { factory } from "./util/debug.js";

const debug = factory(import.meta.url);
const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get("/", (req, res) => {
  debug(`${req.method} ${req.path} called...`);
  res.send("Welcome to the Roster API!");
});

app.use(urls);
app.use(auth);

app.use((err, req, res, next) => {
  if (err) {
    debug(err);
    const code = err.status || 500;
    res.status(code).json({
      status: code,
      message: err.message || `Internal Server Error!`,
    });
  }
  next();
});

export default app;
