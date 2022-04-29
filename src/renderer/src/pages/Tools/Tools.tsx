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
} from "./Actions";
import { StartJackWithJacktripClientOnActiveBees } from "./Actions/StartJackWithJacktripClientOnActiveBees";

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
      </ActionsContainer>
    </Card>
  </Z3Page>
);
