// TSDoc の本文が英語なので英語版を指す。defaultLocale が ja なので en は /en/ 配下
const REFERENCE_BASE_URL = "https://gassma.io/en/docs";

const renderDocBlock = (indent: string, lines: string[]) => {
  const body = lines.map((line) => `${indent} * ${line}\n`).join("");

  return `${indent}/**\n${body}${indent} */\n`;
};

export { REFERENCE_BASE_URL, renderDocBlock };
