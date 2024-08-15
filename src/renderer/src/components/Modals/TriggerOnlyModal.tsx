import React, { useCallback, useEffect, useState } from "react";
import { BaseModal, BaseModalProps } from "@components/Modals/BaseModal";
import { TaskList } from "@components/TaskList";
import { TaskListItemState } from "@components/TaskList/TaskListItem";

interface TriggerOnlyModalProps
  extends Pick<BaseModalProps, "open" | "onClose"> {}

export const TriggerOnlyModal = ({ open, onClose }: TriggerOnlyModalProps) => {
  const [isOpen, setIsOpen] = useState(open);
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [activeIndexState, setActiveIndexState] = useState(
    TaskListItemState.Active
  );

  useEffect(() => setIsOpen(open), [open]);

  /**
   * Close the modal
   */
  const closeModal = useCallback(() => {
    setActiveIndex(-1);
    setIsConnecting(false);
    onClose();
  }, []);

  /**
   * Connect the bees
   */
  const connectBees = useCallback(async () => {
    // Set the default active state to active
    setActiveIndexState(TaskListItemState.Active);

    // Set cleaning state to true
    setIsConnecting(true);

    /* Fetch active bees */
    setActiveIndex(0);
    const activeBees = await window.kweenb.methods.fetchActiveBees();

    /* Check realtime status of active bees */
    setActiveIndex(1);
    const currentBeeStates = await window.kweenb.methods.getCurrentBeeStates(
      activeBees
    );
    // check if in currentBeeStates, every state has a lastPingResponse
    // if not, set activeIndexState to TaskListItemState.Error
    const hasLastPingResponse = currentBeeStates.every(
      (state) => state.lastPingResponse
    );
    if (!hasLastPingResponse) {
      setIsConnecting(false);
      setActiveIndexState(TaskListItemState.Error);
      return;
    }

    /* Check if zwerm3 API is running on active bees */
    setActiveIndex(2);
    // check if currentBeeStates, every state has isApiOn
    // if not, set activeIndexState to TaskListItemState.Error
    const hasBeesWithoutZwerm3ApiRunning =
      activeBees.filter((bee) => !bee.isApiOn).length > 0;
    if (hasBeesWithoutZwerm3ApiRunning) {
      setIsConnecting(false);
      setActiveIndexState(TaskListItemState.Error);
      return;
    }

    /* Kill Jack processes on active bees */
    setActiveIndex(3);
    const killAllJackProcessesPromises = activeBees.map((bee) =>
      window.kweenb.methods.killJack(bee)
    );
    await Promise.all(killAllJackProcessesPromises);

    /* Start Jack on active bees */
    setActiveIndex(4);
    const startJackPromises = activeBees.map((bee) => {
      return window.kweenb.methods.startJack(bee, true);
    });
    await Promise.all(startJackPromises);

    /* Start Pure Data on active bees */
    setActiveIndex(5);
    const startPureDataPromises = activeBees.map((bee) => {
      return window.kweenb.methods.startPureData(bee);
    });
    await Promise.all(startPureDataPromises);

    /* Close the modal */
    setActiveIndex(-1);

    // Set building state to false
    setIsConnecting(false);

    // Close the modal
    closeModal();
  }, []);

  useEffect(() => {
    if (open) {
      connectBees();
    }
  }, [open]);

  return (
    <BaseModal disableBackdropClick open={isOpen} onClose={closeModal}>
      <TaskList
        tasks={[
          "Fetch active bees",
          "Realtime check to see if every active bee is alive",
          "Check if zwerm3 API is running on active bees",
          "Kill Jack on active bees",
          "Start Jack on active bees",
          "Start Pure Data on active bees",
        ]}
        activeIndex={activeIndex}
        activeIndexState={activeIndexState}
      />
    </BaseModal>
  );
};
