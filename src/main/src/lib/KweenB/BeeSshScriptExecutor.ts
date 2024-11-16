/**
 * The BeeScriptExecutor class is responsible for executing a script
 * locally, that uses SSH to execute a script on the bee.
 */

import { IBee } from "@shared/interfaces";
import { resourcesPath } from "@shared/resources";
import { exec } from "child_process";

export default class BeeSshScriptExecutor {
  private privateKeyPath: string;

  constructor() {
    this.privateKeyPath = `${resourcesPath}/kweenb.key`;
  }

  /**
   * Execute a script without any output
   * @param script The script to execute
   * @param bees The bees to execute the script on
   * @returns
   */
  async executeWithNoOutput(script: string, bees: IBee[]): Promise<void> {
    try {
      return new Promise((resolve, reject) => {
        const command = `${resourcesPath}/scripts/${script} -k ${
          this.privateKeyPath
        } ${bees.map((b) => b.ipAddress).join(" ")}`;

        exec(command, (error: any, stdout: any, stderr: any) => {
          if (error || stderr) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.error("Error executing script:", error);
      throw error;
    }
  }

  /**
   * Execute a script with output
   * @param script The script to execute
   * @param bees The bees to execute the script on
   * @returns
   */
  async executeWithOutput<T>(
    script: string,
    bees: IBee[]
  ): Promise<T | undefined> {
    try {
      if (!bees || bees.length === 0) return;
      return new Promise<T>((resolve, reject) => {
        const command = `${resourcesPath}/scripts/${script} -k ${
          this.privateKeyPath
        } ${bees.map((b) => b.ipAddress).join(" ")}`;

        exec(command, (error: any, stdout: any, stderr: any) => {
          if (error || stderr) {
            reject(error as T);
          } else {
            resolve(stdout as T);
          }
        });
      });
    } catch (error) {
      console.error("Error executing script:", error);
      throw error;
    }
  }
}
