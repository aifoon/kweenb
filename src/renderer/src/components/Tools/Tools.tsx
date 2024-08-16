import { Card } from "@components/Cards";
import React from "react";
import { useAppStore } from "@renderer/src/hooks";
import { AppMode } from "@shared/enums";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { PageHeader } from "@components/PageHeader";
import { Z3Page } from "@components/Layout";
import {
  ActiveBeesOnline,
  IsZwerm3ApiRunningOnBees,
  KillAllBeeProcesses,
  KillAllKweenBProcesses,
  MakeHubAudioConnections,
  StartJackWithJacktripHubClientOnActiveBees,
  StartJackWithJacktripHubClientOnKweenB,
  StartJackWithJacktripP2PServerOnActiveBees,
  StartJackWithJacktripP2PClientsOnKweenB,
  MakeP2PAudioConnectionsOnKweenB,
  MakeP2PAudioConnectionOnActiveBees,
  DisconnectP2PAudioConnectionsOnKweenB,
  StartJacktripHubServer,
  StartPureDataOnActiveBees,
} from "./Actions";

export const Tools = () => {
  const appMode = useAppStore((state) => state.appMode);
  return (
    <Z3Page pageHeader={<PageHeader title="Tools" />}>
      <Card title="Actions">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ width: "45%" }}>Description</TableCell>
              <TableCell style={{ width: "45%" }}>Output</TableCell>
              <TableCell style={{ width: "10%" }} />
            </TableRow>
          </TableHead>
          <TableBody>
            <ActiveBeesOnline />
            <IsZwerm3ApiRunningOnBees />
            <KillAllBeeProcesses />
            <KillAllKweenBProcesses />
            {appMode === AppMode.Hub && (
              <>
                <StartJacktripHubServer />
                <StartJackWithJacktripHubClientOnActiveBees />
                <StartPureDataOnActiveBees />
                <StartJackWithJacktripHubClientOnKweenB />
                <MakeHubAudioConnections />
              </>
            )}
            {appMode === AppMode.P2P && (
              <>
                <StartJackWithJacktripP2PServerOnActiveBees />
                <StartPureDataOnActiveBees />
                <StartJackWithJacktripP2PClientsOnKweenB />
                <MakeP2PAudioConnectionOnActiveBees />
                <MakeP2PAudioConnectionsOnKweenB />
              </>
            )}
          </TableBody>
        </Table>
      </Card>
    </Z3Page>
  );
};
