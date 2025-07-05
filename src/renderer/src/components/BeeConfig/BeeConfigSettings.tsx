import { Card } from "@components/Cards";
import { useEffect, useState } from "react";
import { Stack, TextField } from "@mui/material";
import Yup from "@renderer/src/yup-ext";
import { IBee } from "@shared/interfaces";

/**
 * Validation schema
 */

const validationSchema = Yup.object({
  ipAddress: Yup.string()
    .required("IP Address is required")
    .matches(
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
      "Invalid IP address format"
    ),
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .matches(
      /^[a-zA-Z0-9_-]+$/,
      "Name can only contain letters, numbers, hyphens, and underscores"
    ),
});

/**
 * Props interface
 */

interface BeeConfigSettingsProps {
  ipAddress: string;
  name: string;
  onUpdate: (config: Partial<Pick<IBee, "ipAddress" | "name">>) => void;
}

/**
 * Component
 */

export const BeeConfigSettings = ({
  ipAddress,
  name,
  onUpdate,
}: BeeConfigSettingsProps) => {
  /**
   * State management
   */

  const [currentBeeConfigSettings, setCurrentBeeConfigSettings] = useState<{
    ipAddress: string;
    name: string;
  }>({ ipAddress, name });
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

    setCurrentBeeConfigSettings((prev) => ({
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
    setCurrentBeeConfigSettings({ ipAddress, name });
    console.log("here", ipAddress, name);
  }, [ipAddress, name]);

  return (
    <Card title="Settings">
      <Stack spacing={2} direction={"column"} gap={2}>
        <TextField
          size="small"
          label="IP Address"
          variant="filled"
          type="text"
          name="ipAddress"
          placeholder="e.g. 192.168.0.2"
          onBlur={handleOnBlur}
          onChange={handleOnChange}
          value={currentBeeConfigSettings.ipAddress}
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
          onChange={handleOnChange}
          onBlur={handleOnBlur}
          value={currentBeeConfigSettings.name}
          error={touched.name && !!errors.name}
          helperText={touched.name && errors.name}
        />
      </Stack>
    </Card>
  );
};
