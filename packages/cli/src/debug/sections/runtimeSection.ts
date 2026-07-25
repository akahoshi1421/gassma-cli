import type { Styler } from "../styles";

const isInteractive = (
  stdinIsTty: boolean,
  term: string | undefined,
): boolean => stdinIsTty && term !== "dumb";

const isCiEnv = (ciValue: string | undefined): boolean =>
  ciValue !== undefined && ciValue !== "" && ciValue.toLowerCase() !== "false";

const buildInteractiveLines = (value: boolean, styler: Styler): string[] => [
  styler.heading("-- Terminal is interactive? --"),
  String(value),
];

const buildCiLines = (value: boolean, styler: Styler): string[] => [
  styler.heading("-- CI detected? --"),
  String(value),
];

export { buildCiLines, buildInteractiveLines, isCiEnv, isInteractive };
