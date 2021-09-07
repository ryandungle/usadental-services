const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");

const consoleConfig = new winston.transports.Console({});

const logFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const transport = new DailyRotateFile({
  filename: "./logs/success.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: false,
  maxSize: "20m",
  maxFiles: "14d",
  prepend: true,
  level: "info",
});
const transportError = new DailyRotateFile({
  filename: "./logs/error.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: false,
  maxSize: "20m",
  maxFiles: "14d",
  prepend: true,
  level: "error",
});

const logger = winston.createLogger({
  format: logFormat,
  transports: [consoleConfig, transport, transportError],
});

module.exports = logger;
