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
    }
  }
}
