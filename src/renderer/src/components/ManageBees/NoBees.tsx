import {
  Button,
  ButtonSize,
  ButtonUse,
  ButtonType,
} from "@components/Buttons/Button";
import { Z3PageCentered } from "@components/Layout";

interface NoBeesProps {
  onAdoptClicked: () => void;
  onNewSpeakerClicked: () => void;
}

export const NoBees = ({
  onAdoptClicked,
  onNewSpeakerClicked,
}: NoBeesProps) => (
  <Z3PageCentered>
    <div style={{ width: "500px", textAlign: "center" }}>
      <h2>Welcome to KweenB!</h2>
      <p>
        Switch your bees on and make sure this computer is on their network.
        KweenB then finds them and adds them by itself.
      </p>
      <Button
        key="adoptFromNetwork"
        buttonSize={ButtonSize.Medium}
        buttonUse={ButtonUse.Normal}
        buttonType={ButtonType.Primary}
        onClick={onAdoptClicked}
      >
        Start adopting from the network
      </Button>
      <p>
        <Button
          key="newSpeaker"
          buttonSize={ButtonSize.Small}
          buttonType={ButtonType.TertiaryWhite}
          onClick={onNewSpeakerClicked}
        >
          Or set up a speaker that was just flashed
        </Button>
      </p>
    </div>
  </Z3PageCentered>
);
