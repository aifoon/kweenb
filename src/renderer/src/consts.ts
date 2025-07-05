/**
 * A file with some constant variables
 */

// Start the design system instead of the application
export const startDesignSystem = false;

// The valid bitrates, sample rates and buffer sizes for the audio settings
export const validBitrates = [8, 16, 24, 32];
export const validSampleRates = [
  22050, 32000, 44100, 48000, 88200, 96000, 192000,
];
export const validBufferSizes = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096];

// Polling interval for fetching bees every ... seconds in useBee
export const pollingInterval = 3000;
