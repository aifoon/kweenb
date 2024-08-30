/**
 * Our main Design System
 */

import { useState } from "react";
import styled from "styled-components";
import { Card, BeeCard } from "@components/Cards";
import {
  Button,
  ButtonUse,
  ButtonType,
  ButtonSize,
} from "@components/Buttons/Button";
import { Label, LabelType } from "@components/Label";
import { Navigation, NavigationButtons } from "@components/Navigation";
import { StatusBulletType } from "@components/StatusBullet";
import {
  Sidebar,
  SidebarButton,
  SidebarStatusBadge,
} from "@components/Sidebar";
import EmojiNatureIcon from "@mui/icons-material/EmojiNature";
import SettingsIcon from "@mui/icons-material/Settings";
import RouteIcon from "@mui/icons-material/Route";
import HandymanIcon from "@mui/icons-material/Handyman";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { SelectField, TextField } from "@components/Forms";
import {
  InputFieldOrientation,
  InputFieldSize,
} from "@components/Forms/InputField";
import { Console } from "@components/Console";
import { SwitchField } from "@components/Forms/SwitchField";
import { Row } from "./Row";
import { ColorCircle } from "./ColorCircle";
import { ChannelType } from "@shared/enums";

// Icons

/**
 * Styled Components
 */

const loremText =
  "Lorem ipsum dolor sit amet consectetur adipisicing elit. Veritatis ad quam obcaecati quibusdam doloremque corrupti dicta quaerat est, pariatur itaque consequatur, accusamus accusantium. Asperiores impedit id modi expedita quos voluptate!";

const DesignSystemWrapper = styled.div`
  padding: 30px 30px 30px 30px;
`;

const DesignSystemSection = styled.div``;

const DesignSystem = () => {
  const [consoleText, setConsoleText] = useState("");
  return (
    <>
      <Navigation title="Design System">
        <NavigationButtons
          buttons={[
            <Button
              key="logging"
              buttonSize={ButtonSize.Small}
              buttonType={ButtonType.TertiaryWhite}
              buttonUse={ButtonUse.Normal}
              onClick={() => console.log("clicking logging")}
            >
              logging
            </Button>,
            <Button
              key="buildTheSwarmNest"
              buttonSize={ButtonSize.Small}
              buttonUse={ButtonUse.Accent}
              onClick={() => console.log("clicking build the swarm nest")}
            >
              build the swarm nest
            </Button>,
          ]}
        />
      </Navigation>
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
            <Button
              buttonType={ButtonType.Secondary}
              buttonUse={ButtonUse.Normal}
            >
              Normal Secondary Button
            </Button>
            <Button
              buttonType={ButtonType.Tertiary}
              buttonUse={ButtonUse.Normal}
            >
              Normal Tertiary Button
            </Button>
          </Row>
          <Row>
            <Button buttonUse={ButtonUse.Accent}>Accent Primary Button</Button>
            <Button
              buttonType={ButtonType.Secondary}
              buttonUse={ButtonUse.Accent}
            >
              Accent Secondary Button
            </Button>
            <Button
              buttonType={ButtonType.Tertiary}
              buttonUse={ButtonUse.Accent}
            >
              Accent Tertiary Button
            </Button>
          </Row>
          <Row>
            <Button buttonUse={ButtonUse.Danger}>Danger Primary Button</Button>
            <Button
              buttonType={ButtonType.Secondary}
              buttonUse={ButtonUse.Danger}
            >
              Danger Secondary Button
            </Button>
            <Button
              buttonType={ButtonType.Tertiary}
              buttonUse={ButtonUse.Danger}
            >
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
          <Row>
            <Button buttonUse={ButtonUse.Dark}>
              Modal Primary Button Medium
            </Button>
            <Button buttonSize={ButtonSize.Small} buttonUse={ButtonUse.Dark}>
              Modal Primary Button Small
            </Button>
            <Button
              buttonType={ButtonType.Secondary}
              buttonUse={ButtonUse.Dark}
            >
              Modal Secondary Button Medium
            </Button>
            <Button
              buttonType={ButtonType.Secondary}
              buttonSize={ButtonSize.Small}
              buttonUse={ButtonUse.Dark}
            >
              Modal Secondary Button Medium
            </Button>
          </Row>
        </DesignSystemSection>

        <hr />

        {/* LABEL */}

        <DesignSystemSection>
          <h2>Labels</h2>
          <Label inline type={LabelType.Primary}>
            Primary
          </Label>
          <br />
          <br />
          <Label inline type={LabelType.Secondary}>
            Secondary
          </Label>
        </DesignSystemSection>

        <hr />

        {/* BEE CARD */}

        <DesignSystemSection>
          <h2>Bee Card</h2>
          <BeeCard
            onBeeConfigClick={() => console.log("Clicked Bee Config")}
            onBeeDeleteClick={() => console.log("Clicked Bee Delete")}
            online
            jackIsRunning
            number={4}
            channelType={ChannelType.MONO}
            channel1={1}
            channel2={2}
          />
        </DesignSystemSection>

        <hr />

        {/* SIDEBAR */}

        <DesignSystemSection>
          <h2>Sidebar</h2>
          <Sidebar
            width="100%"
            height="100%"
            fixedToSide={false}
            badges={[
              <SidebarStatusBadge
                key="theKween"
                text="The Kween"
                status={StatusBulletType.Active}
              />,
            ]}
            buttons={[
              <SidebarButton
                icon={<EmojiNatureIcon />}
                text="Manage Bees"
                key="managebees"
              />,
              <SidebarButton
                active
                icon={<SettingsIcon />}
                text="Bee Settings"
                onClick={() => console.log("Clicking Bee Settings")}
                key="beesettings"
              />,
              <SidebarButton
                icon={<RouteIcon />}
                text="Audio Routes"
                key="audioroutes"
              />,
              <SidebarButton
                icon={<HandymanIcon />}
                text="Tools"
                key="tools"
              />,
            ]}
          />
        </DesignSystemSection>

        {/* CARD */}

        <DesignSystemSection>
          <h2>Card</h2>
          <Card
            title="Family Bee"
            footerButtons={[
              <Button
                onClick={() => console.log("Clicked Card Close Button")}
                buttonSize={ButtonSize.Small}
                buttonType={ButtonType.TertiaryWhite}
                key="cardFooterClose"
              >
                Close
              </Button>,
              <Button
                onClick={() => console.log("Clicked Card Save Button")}
                buttonSize={ButtonSize.Small}
                key="cardFooterSave"
              >
                Save
              </Button>,
            ]}
          >
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Eligendi
            ipsum, ratione quidem recusandae laudantium, corporis adipisci
            consectetur obcaecati laboriosam asperiores natus. Quos doloremque,
            quisquam unde ab pariatur explicabo numquam deleniti!
          </Card>
        </DesignSystemSection>

        <hr />

        <DesignSystemSection>
          <h2>Forms</h2>
          <Formik
            initialValues={{
              username: "",
              password: "",
              jacktrip_version: "",
              use_mqtt: true,
            }}
            validationSchema={Yup.object().shape({
              username: Yup.string().required("The username is required!"),
              password: Yup.string().required("The password is required!"),
              jacktrip_version: Yup.number()
                .min(20)
                .required("A Jacktrip Version is required!"),
            })}
            onSubmit={(values, actions) => {
              console.log({ values, actions });
            }}
          >
            {({ values }) => (
              <Form>
                <TextField
                  orientation={InputFieldOrientation.Horizontal}
                  size={InputFieldSize.Small}
                  label="Username"
                  type="text"
                  labelWidth="150px"
                  name="username"
                  width="500px"
                  placeholder="e.g. timdpaep"
                />
                <TextField
                  orientation={InputFieldOrientation.Horizontal}
                  size={InputFieldSize.Small}
                  label="Password"
                  type="password"
                  labelWidth="150px"
                  width="500px"
                  name="password"
                />
                <SelectField
                  orientation={InputFieldOrientation.Horizontal}
                  size={InputFieldSize.Small}
                  label="Jacktrip Version"
                  labelWidth="150px"
                  width="500px"
                  selectItems={[
                    { label: "None", value: "" },
                    { label: "1.1.1", value: 10 },
                    { label: "1.2.1", value: 20 },
                    { label: "1.3.1", value: 30 },
                    { label: "1.4.1", value: 40 },
                  ]}
                  name="jacktrip_version"
                />
                <SwitchField
                  name="use_mqtt"
                  label="Use MQTT"
                  labelWidth="150px"
                  width="500px"
                  orientation={InputFieldOrientation.Horizontal}
                  size={InputFieldSize.Small}
                />
                <Button buttonSize={ButtonSize.Small} type="submit">
                  Submit
                </Button>

                <h4>Form Values</h4>

                <pre>{JSON.stringify(values, null, 2)}</pre>
              </Form>
            )}
          </Formik>
        </DesignSystemSection>

        <hr />

        <DesignSystemSection>
          <h2>Console</h2>
          <Card
            title="Logging"
            footerButtons={[
              <Button
                buttonSize={ButtonSize.Small}
                buttonType={ButtonType.TertiaryWhite}
                onClick={() => setConsoleText("")}
              >
                Clear
              </Button>,
              <Button
                buttonSize={ButtonSize.Small}
                onClick={() => setConsoleText(`${consoleText} ${loremText}`)}
              >
                Add Text
              </Button>,
            ]}
          >
            <Console height={150}>{consoleText}</Console>
          </Card>
        </DesignSystemSection>
      </DesignSystemWrapper>
    </>
  );
};

export default DesignSystem;
