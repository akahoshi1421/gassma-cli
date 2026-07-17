import { getRemovedCantUseVarChar } from "../../util/getRemovedCantUseVarChar";

const getOneGassmaHavingCore = (
  sheetContent: Record<string, unknown[]>,
  schemaName: string,
  sheetName: string,
) => {
  const oneHavingCore = Object.keys(sheetContent).reduce((pre, columnName) => {
    const removedSpaceCurrentColumnName = getRemovedCantUseVarChar(columnName);

    const oneHavingCoreType = `
export type Gassma${schemaName}${sheetName}${removedSpaceCurrentColumnName}HavingCore = {
  _avg?: Gassma.FilterConditions<number>;
  _count?: Gassma.FilterConditions<number>;
  _max?: Gassma${schemaName}${sheetName}${removedSpaceCurrentColumnName}FilterConditions;
  _min?: Gassma${schemaName}${sheetName}${removedSpaceCurrentColumnName}FilterConditions;
  _sum?: Gassma.FilterConditions<number>;
} & Gassma${schemaName}${sheetName}${removedSpaceCurrentColumnName}FilterConditions;
`;

    return pre + oneHavingCoreType;
  }, "");

  return oneHavingCore;
};

export { getOneGassmaHavingCore };
