import cron from "node-cron";
import { cronjobLogger } from "./logger";
import { processUnivisData } from "../helpers/univis-crawler";
import { Semester } from "../../../../../interfaces/semester";

// CRON job: execute at 3 AM from Monday to Friday
cron.schedule("0 3 * * 1-5", () => {
  const message = `CRON job is running: ${new Date().toLocaleString()}`;
  cronjobLogger.info(message);
  const semester = new Semester().name;
  processUnivisData(semester).then((messages) => {
    for (const message of messages) {
      cronjobLogger.info(message);
    }
  });
});

cronjobLogger.info("CRON job started");