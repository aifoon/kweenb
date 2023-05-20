import { Button, ButtonSize, ButtonType } from "@components/Buttons";
import { PageSidebar } from "@components/Sidebar";
import { Z3PageContentSidebar } from "@renderer/src/layout/Z3PageContentSidebar";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { VolumeControl } from "./VolumeControl";
import { SwarmGroups } from "./SwarmGroups";

export const PositioningModules = () => {
  const navigate = useNavigate();
  const params = useParams();

  return (
    <Z3PageContentSidebar
      pageSidebar={
        <PageSidebar
          buttons={[
            <Button
              key="volumeControl"
              style={{ textAlign: "left" }}
              onClick={() => navigate("/positioning/volumes/volume-control")}
              buttonType={ButtonType.TertiaryWhite}
              buttonSize={ButtonSize.Small}
            >
              Volume Control
            </Button>,
          ]}
        />
      }
    >
      {(!params.tab || params.tab === "volume-control") && <VolumeControl />}
      {params.tab === "swarm-groups" && <SwarmGroups />}
    </Z3PageContentSidebar>
  );
};
