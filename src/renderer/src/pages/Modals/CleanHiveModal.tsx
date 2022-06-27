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

  const closeModal = useCallback(() => {
    setActiveIndex(-1);
    setIsCleaning(false);
    onClose();
  }, []);

  const cleanHive = useCallback(async () => {
    // Set the default active state to active
    setActiveIndexState(TaskListItemState.Active);

    // Set cleaning state to true
    setIsCleaning(true);

    /* Get the active bees */
    const activeBees = await window.kweenb.methods.fetchActiveBees();

    /* Kill Jack & Jacktrip processes on The Kween */
    setActiveIndex(0);
    await window.kweenb.methods.theKween.killJackAndJacktripOnTheKween();

    /* Kill Jack & Jacktrip processes on active bees */
    setActiveIndex(1);
    const killAllProcessesPromises = activeBees.map((bee) => {
      if (bee.isOnline) return window.kweenb.methods.killJackAndJacktrip(bee);
      return Promise.resolve();
    });
    await Promise.all(killAllProcessesPromises);

    /* Kill Jack & Jacktrip processes on kweenb */
    setActiveIndex(2);
    await window.kweenb.methods.killJackAndJacktripOnKweenB();

    /* Close the modal */
    setActiveIndex(-1);

    // Set building state to false
    setIsCleaning(false);

    // Close the modal
    closeModal();
  }, []);

  return (
    <BaseModal open={isOpen} onClose={closeModal}>
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
            {!isCleaning && (
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
