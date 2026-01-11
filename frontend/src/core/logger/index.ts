/**
 * Frontend Logger
 * Provides consistent logging across the application
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

class Logger {
  private isDevelopment = import.meta.env.MODE === 'development';

  /**
   * Log debug messages (development only)
   */
  debug(message: string, context?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      this.log('debug', message, context);
    }
  }

  /**
   * Log informational messages
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  /**
   * Log error messages
   */
  error(message: string, error?: unknown, context?: Record<string, unknown>): void {
    const errorContext = {
      ...context,
      error: this.serializeError(error),
    };
    this.log('error', message, errorContext);
  }

  /**
   * Internal logging method
   */
  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    // In development, use console with formatting
    if (this.isDevelopment) {
      const style = this.getConsoleStyle(level);
      const prefix = `[${level.toUpperCase()}]`;

      console[level === 'debug' ? 'log' : level](
        `%c${prefix}%c ${message}`,
        style,
        'color: inherit',
        context || ''
      );
    } else {
      // In production, log errors to console and could send to monitoring service
      if (level === 'error') {
        console.error(message, entry);

        // TODO: Send to monitoring service (Sentry, LogRocket, etc.)
        // this.sendToMonitoring(entry);
      }
    }
  }

  /**
   * Get console styling for different log levels
   */
  private getConsoleStyle(level: LogLevel): string {
    const styles: Record<LogLevel, string> = {
      debug: 'color: #6B7280; font-weight: bold',
      info: 'color: #3B82F6; font-weight: bold',
      warn: 'color: #F59E0B; font-weight: bold',
      error: 'color: #EF4444; font-weight: bold',
    };
    return styles[level];
  }

  /**
   * Serialize error objects for logging
   */
  private serializeError(error: unknown): Record<string, unknown> {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }
    return { error };
  }
}

// Export singleton instance
export const logger = new Logger();
