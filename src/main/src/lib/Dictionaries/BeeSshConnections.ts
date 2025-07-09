import { SSH_PRIVATE_KEY_PATH, SSH_USERNAME_BEE } from "../../consts";
import { NodeSSH } from "node-ssh";
import SettingHelpers from "../KweenB/SettingHelpers";

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
  public getSshConnection = async (ipAddress: string) => {
    // Create a new NodeSSH instance every time
    const ssh = new NodeSSH();

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
    await ssh.connect({
      host: ipAddress,
      username: SSH_USERNAME_BEE,
      privateKeyPath: sshPrivateKey,
    });

    // return the ssh connection
    return ssh;
  };
}

export default BeeSshConnections;
