import { getRemovedCantUseVarChar } from "../../util/getRemovedCantUseVarChar";
import { isNumberColumn } from "../../util/isNumberColumn";

const getOneGassmaHavingCore = (
  sheetContent: Record<string, unknown[]>,
  schemaName: string,
  sheetName: string,
) => {
  const oneHavingCore = Object.keys(sheetContent).reduce((pre, columnName) => {
    const removedSpaceCurrentColumnName = getRemovedCantUseVarChar(columnName);
    const isNumber = isNumberColumn(sheetContent[columnName]);
    const avgLine = isNumber
      ? "  _avg?: Gassma.FilterConditions<number>;\n"
      : "";
    const sumLine = isNumber
      ? "  _sum?: Gassma.FilterConditions<number>;\n"
      : "";

    const oneHavingCoreType = `
export type Gassma${schemaName}${sheetName}${removedSpaceCurrentColumnName}HavingCore = {
${avgLine}  _count?: Gassma.FilterConditions<number>;
  _max?: Gassma${schemaName}${sheetName}${removedSpaceCurrentColumnName}FilterConditions;
  _min?: Gassma${schemaName}${sheetName}${removedSpaceCurrentColumnName}FilterConditions;
${sumLine}} & Gassma${schemaName}${sheetName}${removedSpaceCurrentColumnName}FilterConditions;
`;

    return pre + oneHavingCoreType;
  }, "");

  return oneHavingCore;
};

export { getOneGassmaHavingCore };
