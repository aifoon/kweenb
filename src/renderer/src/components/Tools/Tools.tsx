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
  IsZwerm3ApiRunningOnTheKween,
  TheKweenOnline,
  ActiveBeesOnline,
  IsZwerm3ApiRunningOnBees,
  KillAllTheKweenProcesses,
  KillAllBeeProcesses,
  StartHubServerOnTheKween,
  KillAllKweenBProcesses,
  ValidateHive,
  MakeHubAudioConnections,
  StartJackWithJacktripHubClientOnActiveBees,
  StartJackWithJacktripHubClientOnKweenB,
  StartJackWithJacktripP2PServerOnActiveBees,
  StartJackWithJacktripP2PClientOnKweenB,
  MakeP2PAudioConnectionsOnKweenB,
  MakeP2PAudioConnectionOnActiveBees,
  DisconnectP2PAudioConnectionsOnKweenB,
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
            {appMode === AppMode.Hub && (
              <>
                <TheKweenOnline />
                <IsZwerm3ApiRunningOnTheKween />
                <ActiveBeesOnline />
                <IsZwerm3ApiRunningOnBees />
                <KillAllTheKweenProcesses />
                <KillAllBeeProcesses />
                <StartHubServerOnTheKween />
                <StartJackWithJacktripHubClientOnActiveBees />
                <KillAllKweenBProcesses />
                <StartJackWithJacktripHubClientOnKweenB />
                <ValidateHive />
                <MakeHubAudioConnections />
              </>
            )}
            {appMode === AppMode.P2P && (
              <>
                <ActiveBeesOnline />
                <IsZwerm3ApiRunningOnBees />
                <KillAllBeeProcesses />
                <KillAllKweenBProcesses />
                <StartJackWithJacktripP2PServerOnActiveBees />
                <StartJackWithJacktripP2PClientOnKweenB />
                <MakeP2PAudioConnectionOnActiveBees />
                <DisconnectP2PAudioConnectionsOnKweenB />
                <MakeP2PAudioConnectionsOnKweenB />
              </>
            )}
          </TableBody>
        </Table>
      </Card>
    </Z3Page>
  );
};
