/**
 * Finding the speakers on the local network. Every speaker announces itself
 * (the service _zwerm3._tcp, under its hostname); what it announces is
 * completed with its own status.
 *
 * Nothing in here needs Electron, so it can be run on its own.
 */

import { Bonjour, Browser, Service } from "bonjour-service";
import { IFoundSpeaker } from "@shared/interfaces";
import SpeakerApi from "./SpeakerApi";

// the service every speaker announces (_zwerm3._tcp)
const SERVICE_TYPE = "zwerm3";

// how often the found speakers are asked for their status
const REFRESH_INTERVAL_MS = 3000;

// a speaker that did not answer this many times in a row is gone
const GONE_AFTER_FAILURES = 3;

// looking stops by itself when nobody asked for the speakers for this long
const STOP_WHEN_NOT_ASKED_MS = 15000;

/**
 * A speaker that announced itself
 */
interface AnnouncedSpeaker {
  hostname: string;
  ipAddress: string;
  failures: number;
  // set as soon as the speaker answered with its status
  found: IFoundSpeaker | null;
}

class SpeakerDiscovery {
  private _bonjour: Bonjour | null = null;
  private _browser: Browser | null = null;
  private _announced: Map<string, AnnouncedSpeaker> = new Map();
  private _refreshInterval: NodeJS.Timeout | null = null;
  private _lastAsked = 0;

  /**
   * Is the network being browsed
   */
  public get isLooking() {
    return this._browser !== null;
  }

  /**
   * The speakers that were found until now. Looking starts with the first
   * call and stops by itself when this is not called for a while.
   */
  public find(): IFoundSpeaker[] {
    this._lastAsked = Date.now();
    if (!this.isLooking) this.start();
    return this.speakers;
  }

  /**
   * The speakers that were found until now
   */
  public get speakers(): IFoundSpeaker[] {
    const speakers: IFoundSpeaker[] = [];
    this._announced.forEach((announced) => {
      if (announced.found) speakers.push(announced.found);
    });
    return speakers.sort((a, b) => a.foundAt.localeCompare(b.foundAt));
  }

  /**
   * Start browsing the network
   */
  public start() {
    if (this.isLooking) return;
    this._lastAsked = Date.now();

    // without a network there is nothing to find, that is not an error
    this._bonjour = new Bonjour(undefined, () => {});
    this._browser = this._bonjour.find({ type: SERVICE_TYPE });
    this._browser.on("up", (service) => this.onAnnounced(service));
    this._browser.on("down", (service) => {
      this._announced.delete(SpeakerDiscovery.hostnameOf(service));
    });

    this._refreshInterval = setInterval(() => {
      if (Date.now() - this._lastAsked > STOP_WHEN_NOT_ASKED_MS) {
        this.stop();
        return;
      }

      // ask again who is there and how the known speakers are doing
      try {
        this._browser?.update();
      } catch (e) {
        // the network is gone for a moment
      }
      this._announced.forEach((announced) => this.refresh(announced));
    }, REFRESH_INTERVAL_MS);
  }

  /**
   * Stop browsing the network and forget what was found
   */
  public stop() {
    if (this._refreshInterval) clearInterval(this._refreshInterval);
    this._refreshInterval = null;
    try {
      this._browser?.stop();
      this._bonjour?.destroy();
    } catch (e) {
      // already closed
    }
    this._browser = null;
    this._bonjour = null;
    this._announced.clear();
  }

  /**
   * The hostname of a service, without the domain (zwerm7, zwerm-new-1a2b)
   */
  private static hostnameOf(service: Service): string {
    return (service.host || service.name || "")
      .replace(/\.$/, "")
      .replace(/\.local$/, "");
  }

  /**
   * A speaker announced itself
   */
  private onAnnounced(service: Service) {
    const hostname = SpeakerDiscovery.hostnameOf(service);

    // the speakers are reached over IPv4
    const isIPv4 = (address: string) => /^\d+\.\d+\.\d+\.\d+$/.test(address);
    const ipAddress =
      (service.addresses || []).find(isIPv4) ||
      (service.referer && isIPv4(service.referer.address)
        ? service.referer.address
        : undefined);
    if (!hostname || !ipAddress) return;

    const announced: AnnouncedSpeaker = {
      hostname,
      ipAddress,
      failures: 0,
      found: null,
    };
    this._announced.set(hostname, announced);
    this.refresh(announced);
  }

  /**
   * Ask a speaker for its status
   */
  private async refresh(announced: AnnouncedSpeaker) {
    const { hostname, ipAddress } = announced;
    try {
      const status = await SpeakerApi.getStatus(ipAddress);
      announced.failures = 0;
      announced.found = {
        hostname,
        ipAddress,
        id: status.identity?.id ?? null,
        softwareVersion: status.apiVersion,
        sounds: status.storage?.scenes ?? 0,
        freeMb: status.storage?.freeMb ?? 0,
        foundAt: announced.found?.foundAt || new Date().toISOString(),
      };
    } catch (e) {
      // a speaker that got its number leaves this address without a word
      announced.failures += 1;
      if (announced.failures >= GONE_AFTER_FAILURES) announced.found = null;
    }
  }
}

export default SpeakerDiscovery;
