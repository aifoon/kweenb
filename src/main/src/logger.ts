// Debugger.ts

/**
 * Debug priority levels
 */
export type DebugPriority = "info" | "warning" | "error";

/**
 * Configuration for the Debugger
 */
export interface DebuggerConfig {
  enabledModules: string[];
  showTimestamp: boolean;
  colors: {
    [key in DebugPriority | "header"]: string;
  };
}

/**
 * A class for handling debug output with module filtering and styled console output
 */
export class Debugger {
  private static instance: Debugger;
  private config: DebuggerConfig = {
    enabledModules: [],
    showTimestamp: true,
    colors: {
      info: "\x1b[36m", // Cyan
      warning: "\x1b[33m", // Yellow
      error: "\x1b[31m", // Red
      header: "\x1b[35m", // Magenta
    },
  };

  private readonly resetColor = "\x1b[0m";
  private lastModule: string | null = null;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}

  /**
   * Get the Debugger instance
   */
  public static getInstance(): Debugger {
    if (!Debugger.instance) {
      Debugger.instance = new Debugger();
    }
    return Debugger.instance;
  }

  /**
   * Initialize the debugger with modules to debug
   * @param modules - Array of module names to enable for debugging
   */
  public initialize(modules: string[], config?: Partial<DebuggerConfig>): void {
    this.config.enabledModules = modules.map((m) => m.toLowerCase());

    if (config) {
      this.config = {
        ...this.config,
        ...config,
        colors: {
          ...this.config.colors,
          ...(config.colors || {}),
        },
      };
    }

    this.log(
      "info",
      "system",
      `Debugger initialized with modules: ${modules.join(", ")}`
    );
  }

  /**
   * Check if a specific module is enabled for debugging
   * @param module - The module name to check
   * @returns boolean indicating if the module is enabled for debugging
   */
  public debugs(module: string): boolean {
    return this.config.enabledModules.includes(module.toLowerCase());
  }

  /**
   * Log a debug message if the module is enabled
   * @param priority - Priority level of the message
   * @param module - The module this log belongs to
   * @param message - The message to log
   * @param data - Optional data to log
   */
  public log(
    priority: DebugPriority,
    module: string,
    message: string,
    data?: any
  ): void {
    if (!this.debugs(module)) return;

    // Convert module name to lowercase for comparison, uppercase for display
    const moduleLower = module.toLowerCase();
    const moduleHeader = module.toUpperCase();

    // Add a newline when switching between modules
    if (this.lastModule !== null && this.lastModule !== moduleLower) {
      console.log("");
    }

    // Update the last module
    this.lastModule = moduleLower;

    // Create timestamp if enabled
    const timestamp = this.config.showTimestamp
      ? `[${new Date().toISOString()}] `
      : "";

    // Format: MODULENAME - [TIMESTAMP] PRIORITY: Message
    console.log(
      `${this.config.colors.header}${moduleHeader}${
        this.resetColor
      } - ${timestamp}${
        this.config.colors[priority]
      }${priority.toUpperCase()}:${this.resetColor} ${message}`
    );

    // Print data if provided
    if (data !== undefined) {
      console.log(data);
    }
  }

  /**
   * Convenience method for info priority logs
   */
  public info(module: string, message: string, data?: any): void {
    this.log("info", module, message, data);
  }

  /**
   * Convenience method for warning priority logs
   */
  public warning(module: string, message: string, data?: any): void {
    this.log("warning", module, message, data);
  }

  /**
   * Convenience method for error priority logs
   */
  public error(module: string, message: string, data?: any): void {
    this.log("error", module, message, data);
  }

  /**
   * Group multiple related logs together
   * @param module - The module this group belongs to
   * @param groupName - Name for the group
   * @param callback - Function containing log calls to group
   */
  public group(module: string, groupName: string, callback: () => void): void {
    if (!this.debugs(module)) return;

    // Convert module name to uppercase for display
    const moduleHeader = module.toUpperCase();
    const moduleLower = module.toLowerCase();

    // Add a newline when switching between modules
    if (this.lastModule !== null && this.lastModule !== moduleLower) {
      console.log("");
    }

    // Create timestamp if enabled
    const timestamp = this.config.showTimestamp
      ? `[${new Date().toISOString()}] `
      : "";

    // Print the group header
    console.log(
      `${this.config.colors.header}${moduleHeader}${this.resetColor} - ${timestamp}${groupName}`
    );

    // Set lastModule for both the group header and contents
    this.lastModule = moduleLower;

    // Execute the callback which will contain the log calls
    callback();

    // Add an empty line after the group is complete
    console.log("");

    // We've already added a line break, so update lastModule
    // to prevent the next log call from adding another one
    this.lastModule = null;
  }
}

// Export a default instance for easy use
export const logger = Debugger.getInstance();

// Export a shorthand function to make it easy to create conditional debug blocks
export function debug(module: string): boolean {
  return logger.debugs(module);
}
