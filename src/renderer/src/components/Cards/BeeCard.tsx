import React, { ReactElement } from "react";
import styled from "styled-components";

interface BeeCardProps {
	number: number;
}

const BeeCardContainer = styled.div`
	border-radius: 15px;
	height: 400px;
	background-color: var(--beeCardBg);
`;

export const BeeCard = ({ number }: BeeCardProps): ReactElement => (
	<BeeCardContainer>{number}</BeeCardContainer>
);
