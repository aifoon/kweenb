import React from "react";
import styled from "styled-components";
import logo from "../images/logo.png";

interface NavigationLogoProps {
  title: string;
}

const LogoWrapper = styled.div`
  display: flex;
  line-height: 21px;
  font-weight: bold;
  font-size: 21px;
  align-items: flex-end;
  & > img {
    margin-right: 10px;
  }
`;

export const NavigationLogo = ({ title = "" }: NavigationLogoProps) => (
  <LogoWrapper>
    <img src={logo} alt={`The ${title} logo`} />
    <span>{title}</span>
  </LogoWrapper>
);
