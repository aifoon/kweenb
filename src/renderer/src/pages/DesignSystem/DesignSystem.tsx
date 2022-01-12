/**
 * Our main Design System
 */

import styled from "styled-components";
import { BeeCard } from "@components/Cards/BeeCard";
import {
	Button,
	ButtonUse,
	ButtonType,
	ButtonSize,
} from "../../components/Button";
import { ColorCircle } from "./ColorCircle";
import { Row } from "./Row";

/**
 * Styled Components
 */

const DesignSystemWrapper = styled.div`
  padding: 30px;
`;

const DesignSystemSection = styled.div``;

const DesignSystem = () => (
	<DesignSystemWrapper>
		{/* Fonts */}

		<DesignSystemSection>
			<h1>H1 - Header 1 - 3.052rem / 48.83px</h1>
			<h2>H2 - Header 2 - 2.441rem / 39.06px</h2>
			<h3>H3 - Header 3 - 1.953rem / 31.25px</h3>
			<h4>H4 - Header 4 - 1.563rem / 25px</h4>
			<h5>H5 - Header 5 - 1.25rem / 20px</h5>
			<p>Paragraph/H6 - Header 6 - 1rem / 16px</p>
			<small>Small Text - 0.8rem - 12.80px</small>
		</DesignSystemSection>

		<hr />

		{/* Colors */}

		<DesignSystemSection>
			<h2>Colors</h2>
			<Row>
				<ColorCircle color="var(--white)" name="white" />
				<ColorCircle color="var(--black)" name="black" />
			</Row>
			<Row>
				<ColorCircle color="var(--primary-100)" name="primary-100" />
				<ColorCircle color="var(--primary-200)" name="primary-200" />
				<ColorCircle color="var(--primary-300)" name="primary-300" />
				<ColorCircle color="var(--primary-400)" name="primary-400" />
				<ColorCircle color="var(--primary-500)" name="primary-500" />
			</Row>
			<Row>
				<ColorCircle color="var(--secondary-100)" name="secondary-100" />
				<ColorCircle color="var(--secondary-200)" name="secondary-200" />
				<ColorCircle color="var(--secondary-300)" name="secondary-300" />
				<ColorCircle color="var(--secondary-400)" name="secondary-400" />
				<ColorCircle color="var(--secondary-500)" name="secondary-500" />
			</Row>
			<Row>
				<ColorCircle color="var(--accent-100)" name="accent-100" />
				<ColorCircle color="var(--accent-200)" name="accent-200" />
				<ColorCircle color="var(--accent-300)" name="accent-300" />
				<ColorCircle color="var(--accent-400)" name="accent-400" />
				<ColorCircle color="var(--accent-500)" name="accent-500" />
			</Row>
		</DesignSystemSection>

		<hr />

		{/* BUTTONS */}

		<DesignSystemSection>
			<h2>Buttons</h2>
			<Row>
				<Button buttonUse={ButtonUse.Normal}>Normal Primary Button</Button>
				<Button buttonType={ButtonType.Secondary} buttonUse={ButtonUse.Normal}>
          Normal Secondary Button
				</Button>
				<Button buttonType={ButtonType.Tertiary} buttonUse={ButtonUse.Normal}>
          Normal Tertiary Button
				</Button>
			</Row>
			<Row>
				<Button buttonUse={ButtonUse.Accent}>Accent Primary Button</Button>
				<Button buttonType={ButtonType.Secondary} buttonUse={ButtonUse.Accent}>
          Accent Secondary Button
				</Button>
				<Button buttonType={ButtonType.Tertiary} buttonUse={ButtonUse.Accent}>
          Accent Tertiary Button
				</Button>
			</Row>
			<Row>
				<Button buttonUse={ButtonUse.Danger}>Danger Primary Button</Button>
				<Button buttonType={ButtonType.Secondary} buttonUse={ButtonUse.Danger}>
          Danger Secondary Button
				</Button>
				<Button buttonType={ButtonType.Tertiary} buttonUse={ButtonUse.Danger}>
          Danger Tertiary Button
				</Button>
			</Row>
			<Row>
				<Button buttonSize={ButtonSize.Small} buttonUse={ButtonUse.Normal}>
          Normal Primary Button
				</Button>
				<Button
					buttonSize={ButtonSize.Small}
					buttonType={ButtonType.Secondary}
					buttonUse={ButtonUse.Normal}
				>
          Normal Secondary Button
				</Button>
				<Button
					buttonSize={ButtonSize.Small}
					buttonType={ButtonType.Tertiary}
					buttonUse={ButtonUse.Normal}
				>
          Normal Tertiary Button
				</Button>
			</Row>
			<Row>
				<Button buttonSize={ButtonSize.Small} buttonUse={ButtonUse.Accent}>
          Accent Primary Button
				</Button>
				<Button
					buttonSize={ButtonSize.Small}
					buttonType={ButtonType.Secondary}
					buttonUse={ButtonUse.Accent}
				>
          Accent Secondary Button
				</Button>
				<Button
					buttonSize={ButtonSize.Small}
					buttonType={ButtonType.Tertiary}
					buttonUse={ButtonUse.Accent}
				>
          Accent Tertiary Button
				</Button>
			</Row>
			<Row>
				<Button buttonSize={ButtonSize.Small} buttonUse={ButtonUse.Danger}>
          Danger Primary Button
				</Button>
				<Button
					buttonSize={ButtonSize.Small}
					buttonType={ButtonType.Secondary}
					buttonUse={ButtonUse.Danger}
				>
          Danger Secondary Button
				</Button>
				<Button
					buttonSize={ButtonSize.Small}
					buttonType={ButtonType.Tertiary}
					buttonUse={ButtonUse.Danger}
				>
          Danger Tertiary Button
				</Button>
			</Row>
			<Row>
				<Button
					buttonSize={ButtonSize.Medium}
					buttonType={ButtonType.TertiaryWhite}
				>
          Tertiary White Button
				</Button>
				<Button
					buttonSize={ButtonSize.Small}
					buttonType={ButtonType.TertiaryWhite}
				>
          Tertiary White Button
				</Button>
			</Row>
		</DesignSystemSection>

		<hr />

		{/* BEE CARD */}

		<DesignSystemSection>
			<h2>Bee Card</h2>
			<BeeCard number={4} />
		</DesignSystemSection>
	</DesignSystemWrapper>
);

export default DesignSystem;
