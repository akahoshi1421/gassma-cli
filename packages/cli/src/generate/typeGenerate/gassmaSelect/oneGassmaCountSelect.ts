import { skipUnion } from "../util/skipUnion";

const getOneGassmaCountSelect = (
  schemaName: string,
  sheetName: string,
  strict?: boolean,
) => {
  const sk = skipUnion(strict);
  const self = `Gassma${schemaName}${sheetName}`;

  return `\nexport type ${self}CountSelect = ${self}Select & {\n  "_all"?: true${sk};\n};\n`;
};

export { getOneGassmaCountSelect };
