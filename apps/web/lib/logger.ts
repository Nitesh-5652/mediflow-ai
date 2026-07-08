// Logger utility for structured logging

interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  timestamp?: string;
  [key: string]: unknown;
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private context: LogContext = {};
  private isDevelopment = process.env.NODE_ENV === 'development';

  setContext(context: LogContext) {
    this.context = { ...this.context, ...context };
  }

  clearContext() {
    this.context = {};
  }

  private formatMessage(level: LogLevel, message: string, data?: unknown) {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      data,
    };
  }

  debug(message: string, data?: unknown) {
    if (this.isDevelopment) {
      console.debug(JSON.stringify(this.formatMessage('debug', message, data)));
    }
  }

  info(message: string, data?: unknown) {
    console.info(JSON.stringify(this.formatMessage('info', message, data)));
  }

  warn(message: string, data?: unknown) {
    console.warn(JSON.stringify(this.formatMessage('warn', message, data)));
  }

  error(message: string, error?: Error | unknown, data?: unknown) {
    const errorData = error instanceof Error ? {
      message: error.message,
      stack: this.isDevelopment ? error.stack : undefined,
    } : error;

    console.error(JSON.stringify(this.formatMessage('error', message, { ...data, error: errorData })));
  }
}

export const logger = new Logger();
export type { LogContext, LogLevel };
