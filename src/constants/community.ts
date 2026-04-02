export const ENCOURAGE_PRESET_KEYS = [
  "praying_with_you",
  "amen",
  "love_hugs",
  "here_for_you",
  "sending_peace",
] as const;

export type EncouragePresetKey = (typeof ENCOURAGE_PRESET_KEYS)[number];

export const ENCOURAGE_PRESETS: { key: EncouragePresetKey; label: string }[] = [
  { key: "praying_with_you", label: "Praying with you" },
  { key: "amen", label: "Amen" },
  { key: "love_hugs", label: "Love & hugs" },
  { key: "here_for_you", label: "Here for you" },
  { key: "sending_peace", label: "Sending peace" },
];

const ENCOURAGE_KEY_SET = new Set<string>(ENCOURAGE_PRESET_KEYS);

export function isValidEncouragePresetKey(key: string): key is EncouragePresetKey {
  return ENCOURAGE_KEY_SET.has(key);
}

export function labelForEncouragePreset(key: string): string {
  const row = ENCOURAGE_PRESETS.find((p) => p.key === key);
  return row?.label ?? key;
}
