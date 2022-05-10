import { Card } from "@components/Cards";
import React from "react";
import { ActionsHeader, ActionsContainer } from "@components/Actions";
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
  MakeAudioConnections,
} from "./Actions";
import { StartJackWithJacktripClientOnActiveBees } from "./Actions/StartJackWithJacktripClientOnActiveBees";
import { StartJackWithJacktripClientOnKweenB } from "./Actions/StartJackWithJacktripClientOnKweenB";

export const Tools = () => (
  <Z3Page pageHeader={<PageHeader title="Tools" />}>
    <Card title="Hive Actions">
      <ActionsContainer>
        <ActionsHeader />
        <TheKweenOnline />
        <IsZwerm3ApiRunningOnTheKween />
        <ActiveBeesOnline />
        <IsZwerm3ApiRunningOnBees />
        <KillAllTheKweenProcesses />
        <KillAllBeeProcesses />
        <StartHubServerOnTheKween />
        <StartJackWithJacktripClientOnActiveBees />
        <KillAllKweenBProcesses />
        <StartJackWithJacktripClientOnKweenB />
        <ValidateHive />
        <MakeAudioConnections />
      </ActionsContainer>
    </Card>
  </Z3Page>
);
