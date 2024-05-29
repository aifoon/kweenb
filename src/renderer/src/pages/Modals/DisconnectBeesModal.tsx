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

interface DisconnectBeesModalProps
  extends Pick<BaseModalProps, "open" | "onClose"> {}

export const DisconnectBeesModal = ({
  open,
  onClose,
}: DisconnectBeesModalProps) => {
  const [isOpen, setIsOpen] = useState(open);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [activeIndexState, setActiveIndexState] = useState(
    TaskListItemState.Active
  );

  useEffect(() => setIsOpen(open), [open]);

  const closeModal = useCallback(() => {
    setActiveIndex(-1);
    setIsDisconnecting(false);
    onClose();
  }, []);

  const disconnectBees = useCallback(async () => {
    // Set the default active state to active
    setActiveIndexState(TaskListItemState.Active);

    // Set cleaning state to true
    setIsDisconnecting(true);

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
      setActiveIndexState(TaskListItemState.Error);
      return;
    }

    /* Kill Jack, Jacktrip and Pure Data processes on active bees */
    setActiveIndex(2);
    const killJackAndJacktripPromises = [];
    const killPureDataPromises = [];
    for (let i = 0; i < activeBees.length; i += 10) {
      const beeGroup = activeBees.slice(i, i + 10);
      for (const bee of beeGroup) {
        if (bee.isOnline) {
          killJackAndJacktripPromises.push(
            window.kweenb.methods.killJackAndJacktrip(bee)
          );
          killPureDataPromises.push(window.kweenb.methods.killPureData(bee));
        }
      }
    }
    await Promise.all(killJackAndJacktripPromises);
    await Promise.all(killPureDataPromises);

    /* Kill Jack & Jacktrip processes on kweenb */
    setActiveIndex(3);
    await window.kweenb.methods.killJackAndJacktripOnKweenB();

    /* Close the modal */
    setActiveIndex(-1);

    // Set building state to false
    setIsDisconnecting(false);

    // Close the modal
    closeModal();
  }, []);

  return (
    <BaseModal open={isOpen} onClose={closeModal}>
      <TaskList
        tasks={[
          "Fetch active bees",
          "Realtime check to see if every active bee is alive",
          "Kill Jack, Jacktrip and Pure Data processes on active bees",
          "Kill Jack & Jacktrip processes on kweenb",
        ]}
        activeIndex={activeIndex}
        activeIndexState={activeIndexState}
      />
      <ConfirmModalFooter>
        <Flex justifyContent="flex-end">
          <ButtonGroup>
            {!isDisconnecting && (
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
              onClick={() => disconnectBees()}
              buttonUse={ButtonUse.Danger}
              disabled={isDisconnecting}
              buttonSize={ButtonSize.Small}
            >
              Disconnect Bees
            </Button>
          </ButtonGroup>
        </Flex>
      </ConfirmModalFooter>
    </BaseModal>
  );
};
