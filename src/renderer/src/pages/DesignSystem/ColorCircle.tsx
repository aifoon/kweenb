/**
 * A Component to show a Color in our Design System
 */

import styled from "styled-components";

interface ColorCircleProps {
  color: string;
  name: string;
}

const ColorCircleWrapper = styled.div`
  text-align: center;
  width: 5rem;
`;

const ColorCircleColor = styled.div`
  background: ${(props) => props.color};
  border-radius: 50%;
  width: 5rem;
  height: 5rem;
  margin-bottom: 0.4rem;
`;

export const ColorCircle = ({ color, name }: ColorCircleProps) => (
  <ColorCircleWrapper>
    <ColorCircleColor color={color} />
    <small>{name}</small>
  </ColorCircleWrapper>
);
