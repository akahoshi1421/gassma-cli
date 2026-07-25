type Styler = {
  heading: (text: string) => string;
  dim: (text: string) => string;
  bold: (text: string) => string;
};

const ESC = "\u001b";

const wrap = (open: string, close: string, text: string): string =>
  `${ESC}[${open}${text}${ESC}[${close}`;

const createStyler = (enabled: boolean): Styler => {
  if (!enabled) {
    return {
      heading: (text) => text,
      dim: (text) => text,
      bold: (text) => text,
    };
  }
  return {
    heading: (text) => wrap("4m", "24m", text),
    dim: (text) => wrap("2m", "22m", text),
    bold: (text) => wrap("1m", "22m", text),
  };
};

const resolveColorEnabled = (
  env: Record<string, string | undefined>,
  stdoutIsTty: boolean,
): boolean => !("NO_COLOR" in env) && stdoutIsTty;

export { createStyler, resolveColorEnabled };
export type { Styler };
