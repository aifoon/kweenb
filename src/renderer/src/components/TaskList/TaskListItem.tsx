import React, { useEffect, useState } from 'react'
import styled from 'styled-components';

export enum TaskListItemState {
  InActive,
  Active,
  Error,
  Success
}

export interface TaskListItemProps {
  description: string
  state: TaskListItemState
}

const TaskListItemLi = styled.li<TaskListItemProps>`
 ${({ state }) => {
    switch(state) {
      case TaskListItemState.Active:
        return `color: var(--white)`;
      case TaskListItemState.Error:
        return `color: var(--red-status)`;
      case TaskListItemState.Success:
        return `color: var(--green-status)`;
      default:
        return `color: var(--grey-400)`;
    }
  }}
`

export const TaskListItem = (props: TaskListItemProps) => {
  const [state, setState] = useState(props.state);

  useEffect(() => {
    setState(props.state)
  }, [props.state])

  return (
    <TaskListItemLi {...props}>{props.description}</TaskListItemLi>
  )
}