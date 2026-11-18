// Canonical registry and types for responsive device types (R-028, R-040).
// Pure data; platform profiles own the responsive taxonomy (R-023).

export const DEVICE_TYPES = {
  mobile: "mobile",
  tablet: "tablet",
  laptop: "laptop",
  desktop: "desktop",
  largeScreen: "large-screen",
} as const;

export type DeviceType = keyof typeof DEVICE_TYPES;

export const DEVICE_TYPE_BY_VALUE: Readonly<Record<string, DeviceType>> = Object.freeze(
  Object.fromEntries(
    (Object.keys(DEVICE_TYPES) as DeviceType[]).flatMap((deviceType) => [
      [DEVICE_TYPES[deviceType], deviceType],
      [deviceType, deviceType],
    ]),
  ),
);

export function isDeviceType(val: unknown): val is DeviceType {
  return typeof val === "string" && val in DEVICE_TYPE_BY_VALUE;
}
