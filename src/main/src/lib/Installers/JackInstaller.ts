import fs from "fs";
import { spawnSync } from "child_process";
import { Installer } from "./Installer";
import path from "path";

export class JackInstaller extends Installer {
  private _keepJackFiles = [
    "QjackCtl.app",
    "jack_alias",
    "jack_bufsize",
    "jack_connect",
    "jack_control_client",
    "jack_cpu_load",
    "jack_disconnect",
    "jack_evmon",
    "jack_freewheel",
    "jack_impulse_grabber",
    "jack_iodelay",
    "jack_latent_client",
    "jack_load",
    "jack_load_test",
    "jack_lsp",
    "jack_metro",
    "jack_midi_dump",
    "jack_midi_latency_test",
    "jack_midiseq",
    "jack_midisine",
    "jack_monitor_client",
    "jack_net_master",
    "jack_net_slave",
    "jack_netsource",
    "jack_property",
    "jack_rec",
    "jack_samplerate",
    "jack_server_control",
    "jack_showtime",
    "jack_simdtests",
    "jack_simple_client",
    "jack_thru_client",
    "jack_transport",
    "jack_transport_client",
    "jack_tw",
    "jack_unload",
    "jack_wait",
    "jack_zombie",
    "jackd",
  ];

  constructor(version: string, targetPath: string) {
    super(
      version,
      "aifoon",
      "jack2-binaries",
      /^jack2-macOS-v(\d+\.\d+\.\d+)\.zip$/,
      targetPath
    );
  }

  /**
   * What to do after the installation
   */
  async afterInstall() {
    fs.readdirSync(this._targetPath).forEach((file) => {
      if (!this._keepJackFiles.includes(file)) {
        fs.rmSync(this._targetPath + "/" + file, {
          recursive: true,
          force: true,
        });
      }
    });
  }
}
