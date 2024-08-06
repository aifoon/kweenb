import styled from "styled-components";

/**
 * Types and Enums
 */

export enum LabelType {
  Primary,
  Secondary,
}

interface LabelProps {
  type: LabelType;
  inline?: boolean;
}

export const Label = styled.div<LabelProps>`
  ${({ inline }) => (inline ? "display: inline-block" : "display: block")};
  padding: 0px 0px;
  text-align: center;
  text-transform: uppercase;
  width: 100%;
  font-weight: bold;
  font-size: 10px;
  ${({ type }) => {
    switch (type) {
      case LabelType.Primary:
        return `
          background-color: var(--primary-100);
          color: var(--white);
          border: 1px solid var(--primary-100);
        `;
      case LabelType.Secondary:
        return `
          background-color: transparant;
          color: var(--primary-100);
          border: 1px solid var(--primary-100);
        `;
      default:
        return `
          background-color: transparant;
          color: var(--primary-100);
          border: 1px solid var(--primary-100);
        `;
    }
  }};
`;
