import { skipUnion } from "../util/skipUnion";

const getOneGassmaOmit = (
  sheetContent: Record<string, unknown[]>,
  schemaName: string,
  sheetName: string,
  strict?: boolean,
) => {
  const sk = skipUnion(strict);
  const oneOmit = Object.keys(sheetContent).reduce((pre, columnName) => {
    const isQuestionMark = columnName.at(-1) === "?";
    const removedQuestionMark = isQuestionMark
      ? columnName.substring(0, columnName.length - 1)
      : columnName;

    return `${pre}  "${removedQuestionMark}"?: true | false${sk};\n`;
  }, `\nexport type Gassma${schemaName}${sheetName}Omit = {\n`);

  return `${oneOmit}};\n`;
};

export { getOneGassmaOmit };
