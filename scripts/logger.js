const winston = require("winston");

const logger = winston.createLogger({
  levels: winston.config.syslog.levels,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.align(),
        winston.format.printf((info) => `[${info.level}]  ${info.message}`)
      ),
    }),
  ],
});

module.exports = logger;
