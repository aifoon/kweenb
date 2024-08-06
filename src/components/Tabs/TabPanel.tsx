import React from "react";
import styled from "styled-components";

type TabPanelProps = {
  children: React.ReactNode;
  value: number;
  index: number;
};

const TabPanelContainer = styled.div`
  margin-top: 30px;
`;

export const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <TabPanelContainer
    role="tabpanel"
    hidden={value !== index}
    id={`simple-tabpanel-${index}`}
    aria-labelledby={`simple-tab-${index}`}
  >
    {value === index && children}
  </TabPanelContainer>
);
