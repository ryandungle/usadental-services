const dotenv = require("dotenv");
const connectDB = require("./helpers/db");
const cron = require("node-cron");
const express = require("express");
const logger = require("./utils/logger");
const { format } = require("date-fns");
const { CacheNext2WeekPatients } = require("./action/appointment");
const {
  getTransactionsByDateRange,
  cacheTransactionsMissouriOffice,
  cacheTransactionsMissouriOfficeManually,
} = require("./action/transaction");

dotenv.config();
connectDB();
const app = express();

app.use(express.json());

cron.schedule("0 */8 * * *", function () {
  logger.info("running a task every 8 hours");
  CacheNext2WeekPatients();
});

cron.schedule("0 2 * * *", function () {
  logger.info("running cache transaction at 2 am");
  cacheTransactionsMissouriOffice();
});

const PORT = process.env.PORT || 5001;

app.listen(
  PORT,
  logger.info(`Server running in ${process.env.NODE_ENV} on ${PORT}`)
);
