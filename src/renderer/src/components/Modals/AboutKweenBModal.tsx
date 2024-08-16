import { BaseModal } from "@components/Modals/BaseModal";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

type AboutKweenBModalProps = {
  open: boolean;
  onClose: () => void;
};

const AboutKweenBModalWrapper = styled.div`
  font-size: 0.9rem;
`;

const AboutKweenBModalContentBlock = styled.div`
  margin-bottom: 1rem;
`;

const AboutKweenBModalTitle = styled.div`
  font-weight: bold;
`;

export const AboutKweenBModal = ({ open, onClose }: AboutKweenBModalProps) => {
  // Internal state
  const [isOpen, setIsOpen] = useState(open);
  const [kweenbVersion, setKweenBVersion] = useState("");

  // When kweenb version is fetched, set it to the state
  useEffect(() => {
    window.kweenb.methods.getKweenBVersion().then((_kweenbVersion) => {
      setKweenBVersion(_kweenbVersion);
    });
  }, []);

  // When the open prop changes, set the internal state
  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  return (
    <BaseModal title="About kweenb" open={isOpen} onClose={onClose}>
      <AboutKweenBModalWrapper>
        <AboutKweenBModalContentBlock>
          <AboutKweenBModalTitle>Version</AboutKweenBModalTitle>
          <div>{kweenbVersion && `v${kweenbVersion}`}</div>
        </AboutKweenBModalContentBlock>
        <AboutKweenBModalContentBlock>
          <AboutKweenBModalTitle>Description</AboutKweenBModalTitle>
          <div>
            KweenB is a speaker audio management application for zwerm3 project
            of Aifoon (BE).
          </div>
        </AboutKweenBModalContentBlock>
        <AboutKweenBModalContentBlock>
          <AboutKweenBModalTitle>Authors</AboutKweenBModalTitle>
          <div>
            <ul>
              <li>Tim De Paepe (tim.depaepe@gmail.com)</li>
            </ul>
          </div>
        </AboutKweenBModalContentBlock>
        <AboutKweenBModalContentBlock>
          <AboutKweenBModalTitle>Support</AboutKweenBModalTitle>
          <div>tim.depaepe@gmail.com</div>
        </AboutKweenBModalContentBlock>
      </AboutKweenBModalWrapper>
    </BaseModal>
  );
};
