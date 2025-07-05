import { Card } from "@components/Cards";
import { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import {
  InputFieldOrientation,
  InputFieldSize,
} from "@components/Forms/InputField";
import Yup from "@renderer/src/yup-ext";
import { IBeeConfig } from "@shared/interfaces";
import { Stack, TextField } from "@mui/material";

/**
 * Validation schema
 */

const validationSchema = Yup.object({
  device: Yup.string()
    .required("Device is required")
    .min(2, "Device must be at least 2 characters")
    .max(50, "Device must be less than 50 characters")
    .matches(
      /^[a-zA-Z0-9_-]+$/,
      "Device can only contain letters, numbers, hyphens, and underscores"
    ),
});

/**
 * Props interface
 */

interface BeeConfigConfigProps {
  beeConfig: IBeeConfig;
  onUpdate: (config: Partial<IBeeConfig>) => void;
}

export const BeeConfigConfig = ({
  beeConfig,
  onUpdate,
}: BeeConfigConfigProps) => {
  /**
   * State management
   */

  const [currentBeeConfig, setCurrentBeeConfig] =
    useState<IBeeConfig>(beeConfig);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  /**
   * Functions
   */

  const handleOnBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setTouched((prev) => ({ ...prev, [name]: true }));

    const isValid = await validateField(name, value);

    // Only update parent if validation passes
    if (isValid) {
      onUpdate({ [name]: value });
    }
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setCurrentBeeConfig((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate if field has been touched
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const validateField = async (fieldName: string, value: string) => {
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

  /**
   * Effects
   */

  useEffect(() => {
    setCurrentBeeConfig(beeConfig);
  }, [beeConfig]);

  return (
    <Card title="Config">
      <Stack spacing={2} direction={"column"} gap={2}>
        <TextField
          size="small"
          label="Device"
          variant="filled"
          type="text"
          name="device"
          placeholder="e.g. hw:Device"
          onBlur={handleOnBlur}
          onChange={handleOnChange}
          value={currentBeeConfig.device}
          error={touched.device && !!errors.device}
          helperText={touched.device && errors.device}
        />
      </Stack>
    </Card>
  );
};
