import { SSH_PRIVATE_KEY_PATH, SSH_USERNAME_BEE } from "../../consts";
import { NodeSSH } from "node-ssh";

class BeeSshConnections {
  // Dictionary to store NodeSSH instances
  private _beeSshInstances: { [ipAddress: string]: NodeSSH } = {};

  /**
   * Get the amount of ssh instances
   */
  public get amountOfSshInstances() {
    return Object.keys(this._beeSshInstances).length;
  }

  /**
   * Get or create the NodeSSH instance for a specific ipAddress
   * @param ipAddress The ip address of the client
   * @returns The NodeSSH instance
   */
  private getNodeSshInstance = (ipAddress: string): NodeSSH => {
    // Check if the instance already exists
    if (this._beeSshInstances[ipAddress]) {
      return this._beeSshInstances[ipAddress];
    }

    // Create a new NodeSSH instance
    const ssh = new NodeSSH();

    // Add the instance to the dictionary
    this._beeSshInstances[ipAddress] = ssh;

    // return the instance
    return ssh;
  };

  /**
   * Get the ssh connection to the client
   * @param ipAddress The ip address of the client
   */
  public getSshConnection = async (ipAddress: string) => {
    // Get or create the NodeSSH instance
    const ssh = this.getNodeSshInstance(ipAddress);

    // if the ssh client is not connected
    if (ssh && !ssh.isConnected()) {
      // connect to the ssh client
      await ssh.connect({
        host: ipAddress,
        username: SSH_USERNAME_BEE,
        privateKeyPath: SSH_PRIVATE_KEY_PATH,
      });
    }

    // return the ssh connection
    return ssh;
  };
}

export default BeeSshConnections;
