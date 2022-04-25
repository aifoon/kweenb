import React from "react";
import styled from "styled-components";
import ScrollToBottom from "react-scroll-to-bottom";
import { css } from "glamor";

interface ConsoleProps {
  children: React.ReactNode;
  height?: number;
}

export const ConsoleWrapper = styled.div<Omit<ConsoleProps, "children">>`
  height: ${({ height }) => height};
  overflow: scroll;
  overflow-x: hidden;

  font-size: var(--smallText);

  *::-webkit-scrollbar {
    width: 8px;
  }

  *::-webkit-scrollbar-thumb {
    background-color: var(--primary-400);
    border-radius: 3px;
  }

  & button {
    background-color: var(--primary-400);
  }
`;

export const Console = ({ children, height }: ConsoleProps) => (
  <ConsoleWrapper>
    <ScrollToBottom
      className={css({
        height: `${height?.toString()}px`,
      }).toString()}
    >
      {children}
    </ScrollToBottom>
  </ConsoleWrapper>
);
