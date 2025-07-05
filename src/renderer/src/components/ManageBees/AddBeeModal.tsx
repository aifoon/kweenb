import {
  InputFieldOrientation,
  InputFieldSize,
} from "@components/Forms/InputField";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import Yup from "@renderer/src/yup-ext";
import { Button, Flex } from "@components/.";
import {
  ButtonUse,
  ButtonType,
  ButtonGroup,
  ButtonSize,
} from "@components/Buttons";
import { ChannelType } from "@shared/enums";
import { IBeeInput } from "@shared/interfaces";
import { BaseModal, BaseModalProps } from "@components/Modals/BaseModal";
import { Box, Stack, TextField } from "@mui/material";
import { ConfirmModalFooter } from "@components/Modals/ConfirmModal";

/**
 * Validation schema
 */

const validationSchema = Yup.object({
  id: Yup.number()
    .min(1, "The minimum amount of bee number is 1")
    .max(149, "The maximum amount of channels is 30")
    .required("The number of a bee is required"),
  name: Yup.string()
    .required("A name is required")
    .matches(
      /^bee\d{2,3}$/,
      "Name must be in format 'bee' followed by a 2-3 digit number (e.g., bee01, bee123)"
    )
    .test(
      "leading-zero",
      "Numbers 1-99 must have leading zero (e.g., bee01, not bee1)",
      function (value) {
        if (!value) return true; // Let required() handle empty values
        const match = value.match(/^bee(\d+)$/);
        if (!match) return true; // Let matches() handle invalid format
        const number = parseInt(match[1], 10);
        return number >= 100 || match[1].length >= 2;
      }
    ),
  ipAddress: Yup.string()
    .required("An IP Address is required")
    .isValidIpAddress("The IP Address is invalid"),
});

/**
 * Props interface
 */

interface AddBeeModalProps extends Pick<BaseModalProps, "open" | "onClose"> {
  onBeeSubmitted: (bee: IBeeInput) => void;
}

/**
 * Component
 */

export const AddBeeModal = ({
  open,
  onClose,
  onBeeSubmitted,
}: AddBeeModalProps) => {
  /**
   * State management
   */

  const [isOpen, setIsOpen] = useState(open);
  const [formValues, setFormValues] = useState({
    id: 1,
    name: "",
    ipAddress: "",
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  /**
   * Functions
   */

  const handleOnBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === "number" ? Number(value) : value;

    setTouched((prev) => ({ ...prev, [name]: true }));
    await validateField(name, parsedValue);
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === "number" ? Number(value) : value;

    setFormValues((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));

    // Validate if field has been touched
    if (touched[name]) {
      validateField(name, parsedValue);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await validateForm();

    if (isValid) {
      onBeeSubmitted({
        ...formValues,
        channelType: ChannelType.MONO,
        channel1: formValues.id,
      });

      // Reset form after successful submission
      setFormValues({
        id: 1,
        name: "",
        ipAddress: "",
        isActive: true,
      });
      setErrors({});
      setTouched({});
    }
  };

  const validateField = async (fieldName: string, value: string | number) => {
    try {
      await validationSchema.validateAt(fieldName, { [fieldName]: value });
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
      return true;
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        setErrors((prev) => ({ ...prev, [fieldName]: error.message }));
      }
      return false;
    }
  };

  const validateForm = async () => {
    try {
      await validationSchema.validate(formValues, { abortEarly: false });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const newErrors: Record<string, string> = {};
        error.inner.forEach((err) => {
          if (err.path) {
            newErrors[err.path] = err.message;
          }
        });
        setErrors(newErrors);
        setTouched({
          id: true,
          name: true,
          ipAddress: true,
        });
      }
      return false;
    }
  };

  /**
   * Effects
   */

  useEffect(() => setIsOpen(open), [open]);

  return (
    <BaseModal open={isOpen} title="Add New Bee" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2} direction={"column"} gap={2}>
          <TextField
            size="small"
            label="Number"
            variant="filled"
            type="number"
            name="id"
            onChange={handleOnChange}
            onBlur={handleOnBlur}
            placeholder="e.g. 1"
            value={formValues.id}
            error={touched.id && !!errors.id}
            helperText={touched.id && errors.id}
          />
          <TextField
            size="small"
            label="IP Address"
            variant="filled"
            type="text"
            name="ipAddress"
            placeholder="e.g. 192.168.0.2"
            onBlur={handleOnBlur}
            onChange={handleOnChange}
            value={formValues.ipAddress}
            error={touched.ipAddress && !!errors.ipAddress}
            helperText={touched.ipAddress && errors.ipAddress}
          />
          <TextField
            size="small"
            label="Name"
            variant="filled"
            type="text"
            name="name"
            placeholder="e.g. bee01"
            onBlur={handleOnBlur}
            onChange={handleOnChange}
            value={formValues.name}
            error={touched.name && !!errors.name}
            helperText={touched.name && errors.name}
          />
        </Stack>
        <ConfirmModalFooter>
          <Box justifyContent="flex-end">
            <ButtonGroup>
              <Button
                type="button"
                onClick={onClose}
                buttonType={ButtonType.TertiaryWhite}
                buttonSize={ButtonSize.Small}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                buttonUse={ButtonUse.Normal}
                buttonSize={ButtonSize.Small}
                buttonType={ButtonType.Primary}
              >
                Save
              </Button>
            </ButtonGroup>
          </Box>
        </ConfirmModalFooter>
      </form>
    </BaseModal>
  );
};
