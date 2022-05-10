import React, { ReactElement, useEffect, useState } from 'react'
import styled from "styled-components";
import { TaskListItem, TaskListItemState, TaskListItemProps } from './TaskListItem';

interface TaskListProps {
  tasks: string[];
  activeIndex: number;
  activeIndexState: TaskListItemState
}

const TaskListUl = styled.ul``

export const TaskList = (props: TaskListProps) => {
  const [activeIndex, setActiveIndex] = useState(props.activeIndex);
  const [activeIndexState, setActiveIndexState] = useState(props.activeIndexState);

  useEffect(() => {
    setActiveIndex(props.activeIndex);
  }, [props.activeIndex])

  useEffect(() => {
    setActiveIndexState(props.activeIndexState);
  }, [props.activeIndexState])

  return (
    <TaskListUl>
      {props.tasks.map((task, index) =>
        <TaskListItem
          key={index}
          description={task}
          state={index === activeIndex ? activeIndexState : TaskListItemState.InActive}
        />
      )}
    </TaskListUl>
  )
}
