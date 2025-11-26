import { config } from './config.js';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private currentLevel: number;

  constructor() {
    this.currentLevel = levels[config.LOG_LEVEL];
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}`;
  }

  debug(message: string, meta?: any) {
    if (this.currentLevel <= levels.debug) {
      console.error(this.formatMessage('debug', message, meta));
    }
  }

  info(message: string, meta?: any) {
    if (this.currentLevel <= levels.info) {
      console.error(this.formatMessage('info', message, meta));
    }
  }

  warn(message: string, meta?: any) {
    if (this.currentLevel <= levels.warn) {
      console.warn(this.formatMessage('warn', message, meta));
    }
  }

  error(message: string, meta?: any) {
    if (this.currentLevel <= levels.error) {
      console.error(this.formatMessage('error', message, meta));
    }
  }
}

export const logger = new Logger();
