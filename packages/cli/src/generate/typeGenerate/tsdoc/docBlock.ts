const REFERENCE_BASE_URL =
  "https://akahoshi1421.github.io/gassma-reference/docs";

const renderDocBlock = (indent: string, lines: string[]) => {
  const body = lines.map((line) => `${indent} * ${line}\n`).join("");

  return `${indent}/**\n${body}${indent} */\n`;
};

export { REFERENCE_BASE_URL, renderDocBlock };
