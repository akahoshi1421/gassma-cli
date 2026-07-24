import { getRemovedCantUseVarChar } from "../../util/getRemovedCantUseVarChar";
import { isNumberColumn } from "../../util/isNumberColumn";
import { skipUnion } from "../util/skipUnion";

const getOneGassmaHavingCore = (
  sheetContent: Record<string, unknown[]>,
  schemaName: string,
  sheetName: string,
  strict?: boolean,
) => {
  const sk = skipUnion(strict);
  const oneHavingCore = Object.keys(sheetContent).reduce((pre, columnName) => {
    const removedSpaceCurrentColumnName = getRemovedCantUseVarChar(columnName);
    const isNumber = isNumberColumn(sheetContent[columnName]);
    const avgLine = isNumber
      ? `  _avg?: Gassma.FilterConditions<number>${sk};\n`
      : "";
    const sumLine = isNumber
      ? `  _sum?: Gassma.FilterConditions<number>${sk};\n`
      : "";

    const oneHavingCoreType = `
export type Gassma${schemaName}${sheetName}${removedSpaceCurrentColumnName}HavingCore = {
${avgLine}  _count?: Gassma.FilterConditions<number>${sk};
  _max?: Gassma${schemaName}${sheetName}${removedSpaceCurrentColumnName}FilterConditions${sk};
  _min?: Gassma${schemaName}${sheetName}${removedSpaceCurrentColumnName}FilterConditions${sk};
${sumLine}} & Gassma${schemaName}${sheetName}${removedSpaceCurrentColumnName}FilterConditions;
`;

    return pre + oneHavingCoreType;
  }, "");

  return oneHavingCore;
};

export { getOneGassmaHavingCore };
