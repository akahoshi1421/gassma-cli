import type { Styler } from "../styles";

const GENERAL_DEBUG_ENV_VARS = [
  "CI",
  "DEBUG",
  "NODE_ENV",
  "NO_COLOR",
  "TERM",
  "NODE_TLS_REJECT_UNAUTHORIZED",
  "NO_PROXY",
  "http_proxy",
  "HTTP_PROXY",
  "https_proxy",
  "HTTPS_PROXY",
];

const buildEnvVarLine = (
  name: string,
  value: string | undefined,
  styler: Styler,
): string => {
  if (value === undefined || value === "") return styler.dim(`- ${name}:`);
  return styler.bold(`- ${name}: \`${value}\``);
};

const buildEnvVarsLines = (
  env: Record<string, string | undefined>,
  styler: Styler,
): string[] => [
  styler.heading("-- Environment variables --"),
  "When not set, the line is dimmed and no value is displayed.",
  "When set, the line is bold and the value is inside the `` backticks.",
  "",
  "For general debugging",
  ...GENERAL_DEBUG_ENV_VARS.map((name) =>
    buildEnvVarLine(name, env[name], styler),
  ),
];

export { buildEnvVarsLines };
