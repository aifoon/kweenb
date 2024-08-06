import styled from "styled-components";

/**
 * Types and Enums
 */

export enum StatusBulletType {
  Active,
  Idle,
  NotActive,
}

export interface StatusBulletProps {
  type: StatusBulletType;
  size?: number;
}

export const StatusBullet = styled.div<StatusBulletProps>`
  border-radius: 50%;
  height: ${({ size }) => (size ? `${size}px` : "16px")};
  width: ${({ size }) => (size ? `${size}px` : "16px")};
  background-color: ${({ type }) => {
    switch (type) {
      case StatusBulletType.Active:
        return "var(--green-status)";
      case StatusBulletType.NotActive:
        return "var(--red-status)";
      case StatusBulletType.Idle:
        return "var(--orange-status)";
      default:
        return "var(--red-status)";
    }
  }};
`;
