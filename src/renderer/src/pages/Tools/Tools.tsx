import { Card } from "@components/Cards";
import React from "react";
import { ActionsHeader, ActionsContainer } from "@components/Actions";
import { useAppContext } from "@renderer/src/hooks";
import { AppMode } from "@shared/enums";
import { PageHeader } from "../../components/PageHeader";
import { Z3Page } from "../../layout";
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
} from "./Actions";

export const Tools = () => {
  const { appContext } = useAppContext();
  return (
    <Z3Page pageHeader={<PageHeader title="Tools" />}>
      <Card title="Actions">
        <ActionsContainer>
          <ActionsHeader />
          {appContext.appMode === AppMode.Hub && (
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
          {appContext.appMode === AppMode.P2P && (
            <>
              <ActiveBeesOnline />
              <IsZwerm3ApiRunningOnBees />
              <KillAllBeeProcesses />
              <KillAllKweenBProcesses />
              <StartJackWithJacktripP2PServerOnActiveBees />
              <StartJackWithJacktripP2PClientOnKweenB />
              <MakeP2PAudioConnectionsOnKweenB />
              <MakeP2PAudioConnectionOnActiveBees />
            </>
          )}
        </ActionsContainer>
      </Card>
    </Z3Page>
  );
};
