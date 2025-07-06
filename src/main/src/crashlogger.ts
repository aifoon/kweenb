import * as fs from "fs";
import * as path from "path";
import { app } from "electron";

export interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "fatal";
  message: string;
  stack?: string;
  metadata?: Record<string, any>;
  pid?: number;
  platform?: string;
  nodeVersion?: string;
  memoryUsage?: NodeJS.MemoryUsage;
}

export interface CrashLoggerOptions {
  includeSystemInfo?: boolean;
  maxLogFileSizeMB?: number;
  logRotationCount?: number;
}

export class CrashLogger {
  private logPath: string = "";
  private options: Required<CrashLoggerOptions>;

  constructor(options: CrashLoggerOptions = {}) {
    this.options = {
      includeSystemInfo: true,
      maxLogFileSizeMB: 10,
      logRotationCount: 5,
      ...options,
    };

    this.initializeLogPath();
  }

  private initializeLogPath(): void {
    try {
      if (app.isReady()) {
        // App is ready, use userData path
        this.logPath = path.join(app.getPath("userData"), "app.log");
      } else {
        // App not ready, wait for it
        app.whenReady().then(() => {
          this.logPath = path.join(app.getPath("userData"), "app.log");
          this.ensureLogDirectory();
          this.checkLogRotation();
        });
        // Temporary fallback until app is ready
        this.logPath = path.join(require("os").tmpdir(), "electron-app.log");
      }
    } catch (error) {
      console.error("CrashLogger: Critical error setting log path:", error);
      // Final fallback
      this.logPath = path.join(require("os").tmpdir(), "electron-app.log");
    }

    this.ensureLogDirectory();
    this.checkLogRotation();
  }

  private ensureLogDirectory(): void {
    try {
      const logDir = path.dirname(this.logPath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    } catch (error) {
      // If we can't create log directory, fall back to current directory
      this.logPath = path.join(process.cwd(), "app.log");
    }
  }

  private writeToFile(entry: LogEntry): void {
    try {
      const logLine = this.formatLogEntry(entry) + "\n";
      fs.appendFileSync(this.logPath, logLine);
    } catch (error) {
      // Critical: Log write failure - this is important to know about
      console.error("CrashLogger: Failed to write to log file:", error);
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp;
    const level = entry.level.toUpperCase().padEnd(5);
    const message = entry.message;

    let logLine = `${timestamp} [${level}] ${message}`;

    // Add system info if available and enabled
    if (this.options.includeSystemInfo && entry.pid) {
      logLine += ` (PID: ${entry.pid})`;
    }

    // Add stack trace if available
    if (entry.stack) {
      logLine += `\nStack: ${entry.stack}`;
    }

    // Add metadata if available
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      logLine += `\nMetadata: ${JSON.stringify(entry.metadata, null, 2)}`;
    }

    // Add memory usage for error/fatal logs
    if (
      (entry.level === "error" || entry.level === "fatal") &&
      entry.memoryUsage
    ) {
      const memory = entry.memoryUsage;
      logLine += `\nMemory: RSS=${this.formatBytes(
        memory.rss
      )}, Heap=${this.formatBytes(memory.heapUsed)}/${this.formatBytes(
        memory.heapTotal
      )}`;
    }

    return logLine;
  }

  private formatBytes(bytes: number): string {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(1)}MB`;
  }

  private checkLogRotation(): void {
    try {
      if (!fs.existsSync(this.logPath)) return;

      const stats = fs.statSync(this.logPath);
      const sizeMB = stats.size / 1024 / 1024;

      if (sizeMB > this.options.maxLogFileSizeMB) {
        this.rotateLogFile();
      }
    } catch (error) {
      // Ignore rotation errors
    }
  }

  private rotateLogFile(): void {
    try {
      // Rotate existing log files
      for (let i = this.options.logRotationCount - 1; i >= 1; i--) {
        const oldFile = `${this.logPath}.${i}`;
        const newFile = `${this.logPath}.${i + 1}`;

        if (fs.existsSync(oldFile)) {
          if (i === this.options.logRotationCount - 1) {
            // Delete the oldest file
            fs.unlinkSync(oldFile);
          } else {
            fs.renameSync(oldFile, newFile);
          }
        }
      }

      // Move current log to .1
      if (fs.existsSync(this.logPath)) {
        fs.renameSync(this.logPath, `${this.logPath}.1`);
      }

      // Log rotation info in new file
      this.info("Log file rotated due to size limit");
    } catch (error) {
      // If rotation fails, just continue - better to have logs than no logs
    }
  }

  private createLogEntry(
    level: LogEntry["level"],
    message: string,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      stack: error?.stack,
      metadata: error
        ? {
            name: error.name,
            message: error.message,
          }
        : undefined,
    };

    // Add system info if enabled
    if (this.options.includeSystemInfo) {
      entry.pid = process.pid;
      entry.platform = process.platform;
      entry.nodeVersion = process.version;

      // Add memory usage for error and fatal logs
      if (level === "error" || level === "fatal") {
        entry.memoryUsage = process.memoryUsage();
      }
    }

    return entry;
  }

  info(message: string): void {
    const entry = this.createLogEntry("info", message);
    this.writeToFile(entry);
  }

  warn(message: string, error?: Error): void {
    const entry = this.createLogEntry("warn", message, error);
    this.writeToFile(entry);
  }

  error(message: string, error?: Error): void {
    const entry = this.createLogEntry("error", message, error);
    this.writeToFile(entry);
  }

  fatal(message: string, error?: Error): void {
    const entry = this.createLogEntry("fatal", message, error);
    this.writeToFile(entry);
  }

  // Log with custom metadata
  logWithMetadata(
    level: LogEntry["level"],
    message: string,
    metadata: Record<string, any>,
    error?: Error
  ): void {
    const entry = this.createLogEntry(level, message, error);
    entry.metadata = { ...entry.metadata, ...metadata };
    this.writeToFile(entry);
  }

  // Log performance metrics
  logPerformance(
    operation: string,
    durationMs: number,
    metadata?: Record<string, any>
  ): void {
    const perfMetadata = {
      operation,
      durationMs,
      timestamp: Date.now(),
      ...metadata,
    };

    this.logWithMetadata(
      "info",
      `Performance: ${operation} took ${durationMs}ms`,
      perfMetadata
    );
  }

  // Log system state
  logSystemState(context: string): void {
    const systemInfo = {
      context,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid,
      windowCount:
        require("electron").BrowserWindow?.getAllWindows?.()?.length || 0,
    };

    this.logWithMetadata("info", `System state: ${context}`, systemInfo);
  }

  // Get log statistics
  getStats(): {
    logPath: string;
    logFileSize: number;
  } {
    let logFileSize = 0;
    try {
      if (fs.existsSync(this.logPath)) {
        logFileSize = fs.statSync(this.logPath).size;
      }
    } catch (error) {
      // Ignore error
    }

    return {
      logPath: this.logPath,
      logFileSize,
    };
  }

  getLogPath(): string {
    return this.logPath;
  }

  // Read recent log entries (useful for debugging)
  getRecentLogs(lines: number = 100): string[] {
    try {
      if (!fs.existsSync(this.logPath)) return [];

      const content = fs.readFileSync(this.logPath, "utf8");
      const allLines = content.split("\n").filter((line) => line.trim());

      return allLines.slice(-lines);
    } catch (error) {
      return [`Error reading log file: ${error}`];
    }
  }
}

// Singleton instance with simplified options
export const crashlogger = new CrashLogger({
  includeSystemInfo: true, // Include PID, platform, etc.
  maxLogFileSizeMB: 5, // Rotate when log exceeds 5MB
  logRotationCount: 3, // Keep 3 rotated log files
});
