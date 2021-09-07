const dotenv = require("dotenv");
const connectDB = require("./helpers/db");
const cron = require("node-cron");
const express = require("express");
const logger = require("./utils/logger");
const { CacheNext2WeekPatients } = require("./action/appointment");

dotenv.config();
connectDB();
const app = express();

cron.schedule("* 8 * * *", function () {
  logger.info("running a task every 8 hours");
  CacheNext2WeekPatients();
});

app.listen(3000);
