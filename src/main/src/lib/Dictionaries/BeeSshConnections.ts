import { SSH_PRIVATE_KEY_PATH, SSH_USERNAME_BEE } from "../../consts";
import { NodeSSH } from "node-ssh";
import SettingHelpers from "../KweenB/SettingHelpers";

/**
 * This class is a proxy for a NodeSSH connection to a bee
 * It creates a new NodeSSH instance every time, and disposes it after use
 */
class BeeSshConnection {
  private _ssh: NodeSSH;

  constructor(ssh: NodeSSH) {
    this._ssh = ssh;
  }

  /**
   * Get the underlying NodeSSH instance
   */
  public get ssh() {
    return this._ssh;
  }

  /**
   * Execute a command on the SSH connection
   * @param command The command to execute
   * @returns The command output
   */
  public async execCommand(command: string) {
    try {
      return await this._ssh.execCommand(command);
    } catch (error) {
      console.error("Error executing SSH command:", error);
      throw error;
    } finally {
      this.dispose();
    }
  }

  /**
   * Dispose the SSH connection
   */
  public dispose() {
    this._ssh.dispose();
  }
}

/**
 * This class manages SSH connections to bees
 * It creates a new NodeSSH instance every time a connection is requested
 * and disposes it after use
 */
class BeeSshConnections {
  private _connectionCount = 0;

  /**
   * Get the total number of SSH connections created
   */
  public get connectionCount() {
    return this._connectionCount;
  }

  /**
   * Get the ssh connection to the client
   * @param ipAddress The ip address of the client
   */
  public getSshConnection = async (
    ipAddress: string
  ): Promise<BeeSshConnection> => {
    // Create a new NodeSSH instance every time
    const ssh = new NodeSSH();

    // create a new bee ssh connection
    const beeSshConnection = new BeeSshConnection(ssh);

    // Increment the connection counter
    this._connectionCount++;

    // @debug Console log the connection count and IP address
    // console.log(
    //   `Creating SSH connection #${this._connectionCount} to ${ipAddress}`
    // );

    // get the location of the ssh private key
    const sshPrivateKey =
      (await SettingHelpers.getAllSettings()).kweenBSettings.sshKeyPath ||
      SSH_PRIVATE_KEY_PATH;

    // connect to the ssh client
    await beeSshConnection.ssh.connect({
      host: ipAddress,
      username: SSH_USERNAME_BEE,
      privateKeyPath: sshPrivateKey,
    });

    // return the ssh connection
    return beeSshConnection;
  };
}

export default BeeSshConnections;
