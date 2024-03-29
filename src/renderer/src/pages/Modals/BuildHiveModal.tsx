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

interface BuildHiveModalProps
  extends Pick<BaseModalProps, "open" | "onClose"> {}

export const BuildHiveModal = ({ open, onClose }: BuildHiveModalProps) => {
  const [isOpen, setIsOpen] = useState(open);
  const [isBuilding, setIsBuilding] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [activeIndexState, setActiveIndexState] = useState(
    TaskListItemState.Active
  );

  useEffect(() => setIsOpen(open), [open]);

  const closeModal = useCallback(() => {
    setActiveIndex(-1);
    setIsBuilding(false);
    onClose();
  }, []);

  const buildHive = useCallback(async () => {
    // Set the default active state to active
    setActiveIndexState(TaskListItemState.Active);

    // Set building state to true
    setIsBuilding(true);

    /* Check if The Kween is online */
    setActiveIndex(0);
    const theKween = await window.kweenb.methods.theKween.fetchTheKween();
    if (!theKween.isOnline) {
      setIsBuilding(false);
      setActiveIndexState(TaskListItemState.Error);
      return;
    }

    /* Check if zwerm3 API is running on The Kween */
    setActiveIndex(1);
    const isZwerm3ApiRunningOnTheKween =
      await window.kweenb.methods.theKween.isZwerm3ApiRunningOnTheKween();
    if (!isZwerm3ApiRunningOnTheKween) {
      setIsBuilding(false);
      setActiveIndexState(TaskListItemState.Error);
      return;
    }

    /* Check if all active bees are online */
    setActiveIndex(2);
    const activeBees = await window.kweenb.methods.fetchActiveBees();
    if (!activeBees || activeBees.length === 0) {
      setIsBuilding(false);
      setActiveIndexState(TaskListItemState.Error);
      return;
    }
    const hasOfflineBees = activeBees.filter((bee) => !bee.isOnline).length > 0;
    if (hasOfflineBees) {
      setIsBuilding(false);
      setActiveIndexState(TaskListItemState.Error);
      return;
    }

    /* Check if zwerm3 API is running on active bees */
    setActiveIndex(3);
    const hasBeesWithoutZwerm3ApiRunning =
      activeBees.filter((bee) => !bee.isApiOn).length > 0;
    if (hasBeesWithoutZwerm3ApiRunning) {
      setIsBuilding(false);
      setActiveIndexState(TaskListItemState.Error);
      return;
    }

    /* Kill Jack & Jacktrip processes on The Kween */
    setActiveIndex(4);
    await window.kweenb.methods.theKween.killJackAndJacktripOnTheKween();

    /* Kill Jack & Jacktrip processes on active bees */
    setActiveIndex(5);
    const killAllProcessesPromises = activeBees.map((bee) =>
      window.kweenb.methods.killJackAndJacktrip(bee)
    );
    await Promise.all(killAllProcessesPromises);

    /* Start hub server on The Kween */
    setActiveIndex(6);
    await window.kweenb.methods.theKween.startHubServerOnTheKween();

    /* Start Jack & Jacktrip on active bees */
    setActiveIndex(7);
    const startJackWithJacktripHubClientPromises = activeBees.map((bee) =>
      window.kweenb.methods.startJackWithJacktripHubClientBee(bee)
    );
    await Promise.all(startJackWithJacktripHubClientPromises);

    /* Kill Jack & Jacktrip processes on kweenb */
    setActiveIndex(8);
    await window.kweenb.methods.killJackAndJacktripOnKweenB();

    /* Start Jack & Jacktrip processes on kweenb */
    setActiveIndex(9);
    await window.kweenb.methods.startJackWithJacktripHubClientKweenB();

    /* Validate if the hive contains all bees and kweenb */
    setActiveIndex(10);
    const isValid = await window.kweenb.methods.theKween.validateHive();
    if (!isValid) {
      setIsBuilding(false);
      setActiveIndexState(TaskListItemState.Error);
      return;
    }

    /* Make audio connections */
    setActiveIndex(11);
    await window.kweenb.methods.theKween.makeHubAudioConnections();

    /* Close the modal */
    setActiveIndex(-1);

    // Set building state to false
    setIsBuilding(false);

    // Close the modal
    closeModal();
  }, []);

  return (
    <BaseModal open={isOpen} onClose={closeModal}>
      <TaskList
        tasks={[
          "Check if The Kween is online",
          "Check if zwerm3 API is running on The Kween",
          "Check if all active bees are online",
          "Check if zwerm3 API is running on active bees",
          "Kill Jack & Jacktrip processes on The Kween",
          "Kill Jack & Jacktrip processes on active bees",
          "Start hub server on The Kween",
          "Start Jack & Jacktrip on active bees",
          "Kill Jack & Jacktrip processes on kweenb",
          "Start Jack & Jacktrip on kweenb",
          "Validate if the hive contains all bees and kweenb",
          "Make all audio connections on The Kween",
        ]}
        activeIndex={activeIndex}
        activeIndexState={activeIndexState}
      />
      <ConfirmModalFooter>
        <Flex justifyContent="flex-end">
          <ButtonGroup>
            {!isBuilding && (
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
              onClick={() => buildHive()}
              buttonUse={ButtonUse.Dark}
              disabled={isBuilding}
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
