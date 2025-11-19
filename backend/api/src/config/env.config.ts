import path from "path";
import * as dotenv from "dotenv";

const envFile = '.env.backend';
dotenv.config({
  path: path.resolve(__dirname, "../../", "environment", envFile),
});