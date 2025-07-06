import { app, BrowserWindow, dialog } from "electron";
import { crashlogger } from "./crashlogger";

export interface GlobalErrorHandlerOptions {
  showErrorDialog?: boolean;
  maxConsecutiveErrors?: number;
  errorCooldownMs?: number;
  enableSafetyShutdown?: boolean; // New option
}

export class GlobalErrorHandler {
  private consecutiveErrors: number = 0;
  private lastErrorTime: number = 0;
  private options: Required<GlobalErrorHandlerOptions>;

  constructor(options: GlobalErrorHandlerOptions = {}) {
    this.options = {
      showErrorDialog: false,
      maxConsecutiveErrors: 10,
      errorCooldownMs: 5000,
      enableSafetyShutdown: false, // Disabled by default
      ...options,
    };

    this.setupErrorHandlers();
    this.setupProcessHandlers(); // Only for user-initiated shutdowns
  }

  private setupErrorHandlers(): void {
    // Handle uncaught exceptions - NEVER EXIT
    process.on("uncaughtException", (error: Error) => {
      this.handleError("Uncaught Exception", error);
    });

    // Handle unhandled promise rejections - NEVER EXIT
    process.on(
      "unhandledRejection",
      (reason: unknown, promise: Promise<any>) => {
        const error =
          reason instanceof Error ? reason : new Error(String(reason));
        this.handleError("Unhandled Promise Rejection", error);
      }
    );

    // Handle SIGPIPE specifically (broken pipe) - NEVER EXIT
    process.on("SIGPIPE", () => {
      crashlogger.warn(
        "SIGPIPE received - broken pipe detected, continuing operation"
      );
    });

    // Handle warning events
    process.on("warning", (warning: Error) => {
      crashlogger.warn(`Process warning: ${warning.name}: ${warning.message}`);
      if (warning.stack) {
        crashlogger.warn(`Warning stack: ${warning.stack}`);
      }
    });
  }

  private setupProcessHandlers(): void {
    // Handle SIGTERM - user/system initiated shutdown
    process.on("SIGTERM", () => {
      crashlogger.info("SIGTERM received - user/system initiated shutdown");
    });

    // Handle Ctrl+C (SIGINT) - user initiated shutdown
    process.on("SIGINT", () => {
      crashlogger.info("SIGINT received - user initiated shutdown (Ctrl+C)");
    });

    // Handle renderer crashes - RECOVER, DON'T EXIT
    app.on("render-process-gone", (event, webContents, details) => {
      crashlogger.error(
        `Renderer process gone: ${details.reason}`,
        new Error(`Exit code: ${details.exitCode}`)
      );

      const window = BrowserWindow.fromWebContents(webContents);
      if (window && !window.isDestroyed()) {
        crashlogger.info("Attempting to reload crashed renderer");
        webContents.reload();
      }
    });

    app.on("child-process-gone", (event, details) => {
      crashlogger.error(
        `Child process gone: ${details.type}, reason: ${details.reason}`,
        new Error(
          `Service name: ${details.serviceName || "unknown"}, exit code: ${
            details.exitCode
          }`
        )
      );
    });
  }

  private handleError(type: string, error: Error): void {
    const now = Date.now();
    const timeSinceLastError = now - this.lastErrorTime;

    // Reset consecutive error count if enough time has passed
    if (timeSinceLastError > this.options.errorCooldownMs) {
      this.consecutiveErrors = 0;
    }

    this.consecutiveErrors++;
    this.lastErrorTime = now;

    // Log the error with context
    crashlogger.error(
      `${type} (#${this.consecutiveErrors}): ${error.message}`,
      error
    );

    // Log additional context
    crashlogger.info(
      `Error context: PID=${process.pid}, Platform=${process.platform}, NodeJS=${process.version}`
    );

    // Show error dialog only in development
    if (this.options.showErrorDialog && !app.isPackaged) {
      this.showErrorDialog(type, error);
    }

    // Check if we've had too many consecutive errors
    if (this.consecutiveErrors >= this.options.maxConsecutiveErrors) {
      if (this.options.enableSafetyShutdown) {
        crashlogger.fatal(
          `Too many consecutive errors (${this.consecutiveErrors}), initiating safety shutdown`
        );
      } else {
        crashlogger.fatal(
          `Too many consecutive errors (${this.consecutiveErrors}), but safety shutdown is disabled`
        );
        crashlogger.fatal(
          "Application may be in an unstable state but will continue running"
        );
      }
      return;
    }

    // Log recovery attempt
    crashlogger.info(
      `Continuing operation after ${type} (${this.consecutiveErrors}/${this.options.maxConsecutiveErrors} consecutive errors)`
    );
  }

  private showErrorDialog(type: string, error: Error): void {
    if (app.isPackaged) return;

    dialog.showErrorBox(
      `${type} (Development Mode)`,
      `An error occurred but the app will continue running.\n\n${error.message}\n\nCheck the logs for more details.`
    );
  }

  // Public methods for manual error reporting
  public reportError(error: Error, context?: string): void {
    const message = context ? `${context}: ${error.message}` : error.message;
    crashlogger.error(message, error);
  }

  public reportWarning(message: string): void {
    crashlogger.warn(message);
  }

  public reportInfo(message: string): void {
    crashlogger.info(message);
  }

  // Manual shutdown method (only if you explicitly want to shut down)
  public shutdown(reason: string): void {
    crashlogger.info(`Manual shutdown requested: ${reason}`);
  }

  // Get current error statistics
  public getErrorStats(): { consecutiveErrors: number; lastErrorTime: number } {
    return {
      consecutiveErrors: this.consecutiveErrors,
      lastErrorTime: this.lastErrorTime,
    };
  }
}

// Create instance with safety shutdown disabled
export const globalErrorHandler = new GlobalErrorHandler({
  showErrorDialog: !app.isPackaged,
  maxConsecutiveErrors: 10,
  errorCooldownMs: 5000,
  enableSafetyShutdown: false, // App will never auto-shutdown due to errors
});
