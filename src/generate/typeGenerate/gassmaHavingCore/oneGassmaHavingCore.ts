import { getRemovedCantUseVarChar } from "../../util/getRemovedCantUseVarChar";

const getOneGassmaHavingCore = (
  sheetContent: Record<string, unknown[]>,
  schemaName: string,
  sheetName: string,
) => {
  const oneHavingCore = Object.keys(sheetContent).reduce((pre, columnName) => {
    const removedSpaceCurrentColumnName = getRemovedCantUseVarChar(columnName);

    const oneHavingCoreType = `
declare type Gassma${schemaName}${sheetName}${removedSpaceCurrentColumnName}HavingCore = {
  _avg?: Gassma${schemaName}${sheetName}${removedSpaceCurrentColumnName}FilterConditions;
  _count?: Gassma${schemaName}${sheetName}${removedSpaceCurrentColumnName}FilterConditions;
  _max?: Gassma${schemaName}${sheetName}${removedSpaceCurrentColumnName}FilterConditions;
  _min?: Gassma${schemaName}${sheetName}${removedSpaceCurrentColumnName}FilterConditions;
  _sum?: Gassma${schemaName}${sheetName}${removedSpaceCurrentColumnName}FilterConditions;
} & Gassma${schemaName}${sheetName}${removedSpaceCurrentColumnName}FilterConditions;
`;

    return pre + oneHavingCoreType;
  }, "");

  return oneHavingCore;
};

export { getOneGassmaHavingCore };
