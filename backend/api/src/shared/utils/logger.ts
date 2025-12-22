import { createLogger, format, transports } from 'winston';
import path from 'path';

const logDirectory = path.join( __dirname, '../../logs');

export const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console({ level: 'info' }),
    new transports.File({ filename: path.join(logDirectory, 'error.log'), level: 'error', format: format.json() }),
    new transports.File({ filename: path.join(logDirectory, 'combined.log'), level: 'info', format: format.json() })
  ]
});

export const cronjobLogger = createLogger({ 
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: path.join(logDirectory, 'cronjob.log'), format: format.json() })
  ]
});
