import KweenBHelpers from "../KweenB/KweenBHelpers";
import Streaming from "./Streaming";
import Zwerm3ApiHelpers from "../KweenB/Zwerm3ApiHelpers";
import { IBee, IHubServerInfo } from "@shared/interfaces";
import SettingHelpers from "../KweenB/SettingHelpers";

export default class HubStreaming extends Streaming {
  /**
   * Distributes an array of IBee objects into clusters
   * @param bees - Array of IBee objects to distribute
   * @param maxBeesPerCluster - Maximum number of bees allowed in each cluster
   * @returns An array of clusters, where each cluster is an array of IBee objects
   */
  public static distributeBeesIntoClusters(
    bees: IBee[],
    maxBeesPerCluster: number
  ): IBee[][] {
    // Input validation
    if (maxBeesPerCluster <= 0) {
      throw new Error("Maximum bees per cluster must be greater than 0");
    }

    // Initialize result array to hold clusters
    const clusters: IBee[][] = [];

    // If no bees, return empty clusters array
    if (bees.length === 0) {
      return clusters;
    }

    // Calculate the number of clusters needed
    const numClusters = Math.ceil(bees.length / maxBeesPerCluster);

    // Initialize each cluster
    for (let i = 0; i < numClusters; i++) {
      clusters.push([]);
    }

    // Distribute bees into clusters
    bees.forEach((bee, index) => {
      const clusterIndex = Math.floor(index / maxBeesPerCluster);
      clusters[clusterIndex].push(bee);
    });

    return clusters;
  }

  /**
   * Connect streaming procedure in HUB mode
   */
  public async handleConnect(): Promise<void> {
    try {
      /**
       * Step 0: Get settings
       */

      const hubModeClusterSize = (await SettingHelpers.getAllSettings())
        .kweenBSettings.hubModeClusterSize;

      /**
       * Step 1: Generic pre-connection check
       */

      const activeBees = await this.preConnectionCheck();

      /**
       * Step 2: Start Jacktrip HUB server on kweenb (take the cluster size into account)
       */

      let hubServerInfo: IHubServerInfo;
      try {
        this.sendInfo("Start Jacktrip HUB server on kweenb");
        hubServerInfo = await KweenBHelpers.startJacktripHubServer();
      } catch (e: any) {
        throw new Error(
          `Error while starting Jacktrip HUB server on kweenb: ${e.message}`
        );
      }

      /**
       * Step 3: Start Jack
       */

      try {
        this.sendInfo("Start Jack on kweenb");
        await KweenBHelpers.startJack();
      } catch (e: any) {
        throw new Error(`Error while starting Jack on kweenb: ${e.message}`);
      }

      /**
       * Step 4: Start Jacktrip client on kweenb
       */

      // let's create a cluster of bees
      const clusters = HubStreaming.distributeBeesIntoClusters(
        activeBees,
        hubModeClusterSize
      );

      try {
        this.sendInfo(
          `Start Jacktrip client on kweenb in ${clusters.length} clusters.`
        );
        const startJacktripHubClientOnKweenBPromises = clusters.map(
          (cluster, i) => {
            KweenBHelpers.startJacktripHubClient(i, cluster.length);
          }
        );
        await Promise.all(startJacktripHubClientOnKweenBPromises);
      } catch (e: any) {
        throw new Error(
          `Error while starting Jack & Jacktrip client on kweenb: ${e.message}`
        );
      }

      /**
       * Step 5: Start Jack & Jacktrip clients on bees
       */

      try {
        this.sendInfo(
          `Start Jack & Jacktrip clients on bees. We have ${clusters.length} ${
            clusters.length === 1 ? "cluster" : "clusters"
          }.`
        );

        // Create an array of promises for each    subarray
        const startJackWithJacktripHubClientBeePromises = clusters.map(
          async (bees) => {
            // For each subarray, create and await all promises for its objects
            const results = await Promise.all(
              bees.map((bee) =>
                Zwerm3ApiHelpers.startJackWithJacktripHubClient(
                  bee.ipAddress,
                  bee.name,
                  hubServerInfo
                )
              )
            );
            return results;
          }
        );

        // Wait for all nested promises to complete
        await Promise.all(startJackWithJacktripHubClientBeePromises);
      } catch (e: any) {
        throw new Error(
          `Error while starting Jack & Jacktrip clients on bees: ${e.message}`
        );
      }

      /**
       * Step 6: Start Pure Data on active bees
       */

      await this.startPureData(activeBees);

      /**
       * Step 7: Make audio connection on active bees
       */

      await this.makeAudioConnection(activeBees);

      /**
       * Step 8: Make all audio connections on kweenb & kweenb hub
       */

      try {
        this.sendInfo("Make all audio connections on kweenb & kweenb hub");
        for (let i = 0; i < clusters.length; i++) {
          await KweenBHelpers.makeHubAudioConnections(clusters[i], i);
        }
      } catch (e: any) {
        throw new Error(
          `Error while making audio connections on kweenb & kweenb hub: ${e.message}`
        );
      }

      /**
       * Exit the process by sending success
       */
      this.sendSuccess();
    } catch (e: any) {
      this.sendError(e.message);
    }
  }
}
