import { skipUnion } from "../util/skipUnion";

const getOneGassmaSelect = (
  sheetContent: Record<string, unknown[]>,
  schemaName: string,
  sheetName: string,
  strict?: boolean,
) => {
  const sk = skipUnion(strict);
  const oneSelct = Object.keys(sheetContent).reduce((pre, columnName) => {
    const isQuestionMark = columnName.at(-1) === "?";
    const removedQuestionMark = isQuestionMark
      ? columnName.substring(0, columnName.length - 1)
      : columnName;

    return `${pre}  "${removedQuestionMark}"?: true${sk};\n`;
  }, `\nexport type Gassma${schemaName}${sheetName}Select = {\n`);

  return `${oneSelct}};\n`;
};

export { getOneGassmaSelect };
