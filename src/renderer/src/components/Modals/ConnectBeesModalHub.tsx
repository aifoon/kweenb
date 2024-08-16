import React, { useCallback, useEffect, useState } from "react";
import { BaseModal, BaseModalProps } from "@components/Modals/BaseModal";
import { TaskList } from "@components/TaskList";
import { TaskListItemState } from "@components/TaskList/TaskListItem";

interface ConnectBeesModalHubProps
  extends Pick<BaseModalProps, "open" | "onClose"> {}

export const ConnectBeesModalHub = ({
  open,
  onClose,
}: ConnectBeesModalHubProps) => {
  const [isOpen, setIsOpen] = useState(open);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [activeIndexState, setActiveIndexState] = useState(
    TaskListItemState.Active
  );

  useEffect(() => {
    setIsOpen(open), [open];
  });

  const closeModal = useCallback(() => {
    setActiveIndex(-1);
    onClose();
  }, []);

  const connectBees = useCallback(async () => {
    // Set the default active state to active
    setActiveIndexState(TaskListItemState.Active);

    /* Check if Jack & Jacktrip is installed on KweenB */
    setActiveIndex(0);
    const isJackAndJacktripInstalled =
      await window.kweenb.methods.isJackAndJacktripInstalled();
    if (!isJackAndJacktripInstalled) {
      setActiveIndexState(TaskListItemState.Error);
      return;
    }

    /* Check if the active bees are online */
    setActiveIndex(1);
    const activeBees = await window.kweenb.methods.fetchActiveBees();
    if (!activeBees || activeBees.length === 0) {
      setActiveIndexState(TaskListItemState.Error);
      return;
    }

    /* Check realtime status of active bees */
    setActiveIndex(2);
    const currentBeeStates = await window.kweenb.methods.getCurrentBeeStates(
      activeBees
    );
    // check if in currentBeeStates, every state has a lastPingResponse
    // if not, set activeIndexState to TaskListItemState.Error
    const hasLastPingResponse = currentBeeStates.every(
      (state) => state.lastPingResponse
    );
    if (!hasLastPingResponse) {
      setActiveIndexState(TaskListItemState.Error);
      return;
    }

    /* Check if zwerm3 API is running on active bees */
    setActiveIndex(3);
    // check if currentBeeStates, every state has isApiOn
    // if not, set activeIndexState to TaskListItemState.Error
    const hasBeesWithoutZwerm3ApiRunning =
      activeBees.filter((bee) => !bee.isApiOn).length > 0;
    if (hasBeesWithoutZwerm3ApiRunning) {
      setActiveIndexState(TaskListItemState.Error);
      return;
    }

    /* Kill Jack & Jacktrip processes on active bees */
    setActiveIndex(4);
    const killAllProcessesPromises = activeBees.map((bee) =>
      window.kweenb.methods.killJackAndJacktrip(bee)
    );
    await Promise.all(killAllProcessesPromises);

    /* Kill Jack & Jacktrip processes on kweenb */
    setActiveIndex(5);
    await window.kweenb.methods.killJackAndJacktripOnKweenB();

    /* Close the modal */
    setActiveIndex(-1);

    // Close the modal
    closeModal();
  }, []);

  useEffect(() => {
    if (open) {
      connectBees();
    }
  }, [open]);

  return (
    <BaseModal open={isOpen} onClose={closeModal}>
      <TaskList
        tasks={[
          "Check if Jack & Jacktrip is installed on KweenB",
          "Fetch active bees",
          "Realtime check to see if every active bee is alive",
          "Check if zwerm3 API is running on active bees",
          "Kill Jack & Jacktrip processes on active bees",
          "Kill Jack & Jacktrip processes on KweenB",
        ]}
        activeIndex={activeIndex}
        activeIndexState={activeIndexState}
      />
    </BaseModal>
  );
};
