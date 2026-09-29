import { createLogger, format, transports } from 'winston';
import path from 'path';

const logDirectory = path.join( __dirname, '../../logs');

// Cap log growth: the files live inside the container and the admin log
// endpoints read them fully into memory before slicing.
const maxsize = 5 * 1024 * 1024; // 5 MB per file
const maxFiles = 5;

export const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console({ level: 'info' }),
    new transports.File({ filename: path.join(logDirectory, 'error.log'), level: 'error', format: format.json(), maxsize, maxFiles }),
    new transports.File({ filename: path.join(logDirectory, 'combined.log'), level: 'info', format: format.json(), maxsize, maxFiles })
  ]
});

export const cronjobLogger = createLogger({ 
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: path.join(logDirectory, 'cronjob.log'), format: format.json(), maxsize, maxFiles })
  ]
});
