import { Button, ButtonSize, ButtonType } from "@components/Buttons";
import { PageSidebar } from "@components/Sidebar";
import { Z3PageContentSidebar } from "@renderer/src/layout/Z3PageContentSidebar";
import React from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import { VolumeControl } from "./VolumeControl";
import { FlyingTag } from "./FlyingTag";
import { SwarmGroups } from "./SwarmGroups";

type PositioningVolumesProps = {};

export const PositioningVolumes = (props: PositioningVolumesProps) => {
  const navigate = useNavigate();
  const params = useParams();

  return (
  <Z3PageContentSidebar
    pageSidebar={
      <PageSidebar
        buttons={[
          <Button key="volumeControl" style={{textAlign: 'left'}} onClick={() => navigate('/positioning/volumes/volume-control')} buttonType={ButtonType.TertiaryWhite} buttonSize={ButtonSize.Small}>Volume Control</Button>,
          <Button key="flyingTag" style={{textAlign: 'left'}} onClick={() => navigate('/positioning/volumes/flying-tag')} buttonType={ButtonType.TertiaryWhite} buttonSize={ButtonSize.Small}>Flying Tag</Button>,
          <Button key="swarmGroups" style={{textAlign: 'left'}} onClick={() => navigate('/positioning/volumes/swarm-groups')} buttonType={ButtonType.TertiaryWhite} buttonSize={ButtonSize.Small}>Swarm Groups</Button>
        ]}
      />
    }
  >
    {(!params.tab|| params.tab === "volume-control") && <VolumeControl />}
    {params.tab === "flying-tag" && <FlyingTag />}
    {params.tab === "swarm-groups" && <SwarmGroups />}
  </Z3PageContentSidebar>
)};
