import path from "path";
import * as dotenv from "dotenv";

const envFile = `.env.${process.env.NODE_ENV || "local"}`;
dotenv.config({
  path: path.resolve(__dirname, "../../", "environment", envFile),
});