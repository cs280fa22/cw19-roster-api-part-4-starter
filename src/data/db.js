import mongoose from "mongoose";
import { factory } from "../util/debug.js";

const debug = factory(import.meta.url);

const option = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

export function connect(URI) {
  mongoose.connect(URI, option);

  mongoose.connection.on("error", (err) => {
    debug("Could not connect to MongoDB");
    debug(err);
  });

  mongoose.connection.on("open", () => {
    debug("Connected to MongoDB!");
  });
}
