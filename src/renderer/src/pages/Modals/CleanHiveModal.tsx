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

interface CleanHiveModalProps
  extends Pick<BaseModalProps, "open" | "onClose"> {}

export const CleanHiveModal = ({ open, onClose }: CleanHiveModalProps) => {
  const [isOpen, setIsOpen] = useState(open);
  const [isCleaning, setIsCleaning] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [activeIndexState, setActiveIndexState] = useState(
    TaskListItemState.Active
  );

  useEffect(() => setIsOpen(open), [open]);

  const cleanHive = useCallback(async () => {
    // Set the default active state to active
    setActiveIndexState(TaskListItemState.Active);

    // Set cleaning state to true
    setIsCleaning(true);

    /* Get the active bees */
    const activeBees = await window.kweenb.methods.fetchActiveBees();

    /* Kill Jack & Jacktrip processes on The Kween */
    setActiveIndex(0);
    await window.kweenb.methods.killJackAndJacktripOnTheKween();

    /* Kill Jack & Jacktrip processes on active bees */
    setActiveIndex(1);
    const killAllProcessesPromises = activeBees.map(async (bee) =>
      window.kweenb.methods.killJackAndJacktrip(bee)
    );
    await Promise.all(killAllProcessesPromises);

    /* Kill Jack & Jacktrip processes on kweenb */
    setActiveIndex(2);
    await window.kweenb.methods.killJackAndJacktripOnKweenB();

    /* Close the modal */
    setActiveIndex(-1);

    // Set building state to false
    setIsCleaning(true);

    // Close the modal
    onClose();
  }, []);

  return (
    <BaseModal open={isOpen} onClose={onClose}>
      <TaskList
        tasks={[
          "Kill Jack & Jacktrip processes on The Kween",
          "Kill Jack & Jacktrip processes on active bees",
          "Kill Jack & Jacktrip processes on kweenb",
        ]}
        activeIndex={activeIndex}
        activeIndexState={activeIndexState}
      />
      <ConfirmModalFooter>
        <Flex justifyContent="flex-end">
          <ButtonGroup>
            <Button
              type="button"
              onClick={onClose}
              buttonType={ButtonType.TertiaryWhite}
              buttonSize={ButtonSize.Small}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => cleanHive()}
              buttonUse={ButtonUse.Dark}
              disabled={isCleaning}
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
