import React from "react";
import styled from "styled-components";
import { StatusBullet, StatusBulletType } from "../StatusBullet";

export interface SidebarBadgeProps {
  key?: string;
  text: string;
  status?: StatusBulletType;
}

const SidebarStatusBadgeContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: var(--primary-100);
  font-weight: bold;
  text-transform: uppercase;
`;

export const SidebarStatusBadge = ({
  status = StatusBulletType.NotActive,
  text = "",
}: SidebarBadgeProps) => (
  <SidebarStatusBadgeContainer>
    <span>{text}</span>
    <StatusBullet type={status} />
  </SidebarStatusBadgeContainer>
);
