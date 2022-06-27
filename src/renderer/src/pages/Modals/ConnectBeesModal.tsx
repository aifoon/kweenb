import React, { useCallback, useEffect, useState } from "react";
import { BaseModal, BaseModalProps } from "@components/Modals/BaseModal";
import { TaskList } from "@components/TaskList";
import { TaskListItemState } from "@components/TaskList/TaskListItem";
import { Flex } from "@components/Flex";
import {
  Button,
  ButtonGroup,
  ButtonType,
  ButtonUse,
  ButtonSize,
} from "@components/Buttons";
import { ConfirmModalFooter } from "@components/Modals/ConfirmModal";

interface ConnectBeesModalProps
  extends Pick<BaseModalProps, "open" | "onClose"> {}

export const ConnectBeesModal = ({ open, onClose }: ConnectBeesModalProps) => {
  const [isOpen, setIsOpen] = useState(open);
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [activeIndexState, setActiveIndexState] = useState(
    TaskListItemState.Active
  );

  useEffect(() => setIsOpen(open), [open]);

  const closeModal = useCallback(() => {
    setActiveIndex(-1);
    setIsConnecting(false);
    onClose();
  }, []);

  const connectBees = useCallback(async () => {
    // Set the default active state to active
    setActiveIndexState(TaskListItemState.Active);

    // Set connecting state to true
    setIsConnecting(true);

    /* Check if the active bees are online */
    setActiveIndex(0);
    const activeBees = await window.kweenb.methods.fetchActiveBees();
    if (!activeBees || activeBees.length === 0) {
      setIsConnecting(false);
      setActiveIndexState(TaskListItemState.Error);
      return;
    }
    const hasOfflineBees = activeBees.filter((bee) => !bee.isOnline).length > 0;
    if (hasOfflineBees) {
      setIsConnecting(false);
      setActiveIndexState(TaskListItemState.Error);
      return;
    }

    /* Check if zwerm3 API is running on active bees */
    setActiveIndex(1);
    const hasBeesWithoutZwerm3ApiRunning =
      activeBees.filter((bee) => !bee.isApiOn).length > 0;
    if (hasBeesWithoutZwerm3ApiRunning) {
      setIsConnecting(false);
      setActiveIndexState(TaskListItemState.Error);
      return;
    }

    /* Kill Jack & Jacktrip processes on active bees */
    setActiveIndex(2);
    const killAllProcessesPromises = activeBees.map((bee) =>
      window.kweenb.methods.killJackAndJacktrip(bee)
    );
    await Promise.all(killAllProcessesPromises);

    /* Kill Jack & Jacktrip processes on kweenb */
    setActiveIndex(3);
    await window.kweenb.methods.killJackAndJacktripOnKweenB();

    /* Start Jack & Jacktrip P2P server on active bees */
    setActiveIndex(4);
    const startJackWithJacktripP2PServerPromises = activeBees.map((bee) =>
      window.kweenb.methods.startJackWithJacktripP2PServerBee(bee)
    );
    await Promise.all(startJackWithJacktripP2PServerPromises);

    /* Start Jack & Jacktrip P2P clients on KweenB */
    setActiveIndex(5);
    const startJackWithJacktripP2PClientPromises = activeBees.map((bee) =>
      window.kweenb.methods.startJackWithJacktripP2PClientKweenB(bee)
    );
    await Promise.all(startJackWithJacktripP2PClientPromises);

    /* Make P2P audio connection on active bees */
    setActiveIndex(6);
    const makeP2PAudioConnectionBeePromises = activeBees.map((bee) =>
      window.kweenb.methods.makeP2PAudioConnectionBee(bee)
    );
    await Promise.all(makeP2PAudioConnectionBeePromises);

    /* Make all P2P audio connections on KweenB */
    setActiveIndex(7);
    await window.kweenb.methods.makeP2PAudioConnectionsKweenB();

    /* Close the modal */
    setActiveIndex(-1);

    // Set building state to false
    setIsConnecting(false);

    // Close the modal
    closeModal();
  }, []);

  return (
    <BaseModal open={isOpen} onClose={closeModal}>
      <TaskList
        tasks={[
          "Check if all active bees are online",
          "Check if zwerm3 API is running on active bees",
          "Kill Jack & Jacktrip processes on active bees",
          "Kill Jack & Jacktrip processes on KweenB",
          "Start Jack & Jacktrip P2P server on active bees",
          "Start Jack & Jacktrip P2P clients on KweenB",
          "Make P2P audio connection on active bees",
          "Make all P2P audio connections on KweenB",
        ]}
        activeIndex={activeIndex}
        activeIndexState={activeIndexState}
      />
      <ConfirmModalFooter>
        <Flex justifyContent="flex-end">
          <ButtonGroup>
            {!isConnecting && (
              <Button
                type="button"
                onClick={onClose}
                buttonType={ButtonType.TertiaryWhite}
                buttonSize={ButtonSize.Small}
              >
                Cancel
              </Button>
            )}
            <Button
              type="button"
              onClick={() => connectBees()}
              buttonUse={ButtonUse.Dark}
              disabled={isConnecting}
              buttonSize={ButtonSize.Small}
            >
              Start
            </Button>
          </ButtonGroup>
        </Flex>
      </ConfirmModalFooter>
    </BaseModal>
  );
};
