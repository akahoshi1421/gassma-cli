import { getRemovedCantUseVarChar } from "../../util/getRemovedCantUseVarChar";

const getOneGassmaHavingCore = (
  sheetContent: Record<string, unknown[]>,
  sheetName: string
) => {
  const oneHavingCore = Object.keys(sheetContent).reduce((pre, columnName) => {
    const removedSpaceCurrentColumnName = getRemovedCantUseVarChar(columnName);

    const oneHavingCoreType = `
export type Gassma${sheetName}${removedSpaceCurrentColumnName}HavingCore = {
  _avg?: Gassma${sheetName}${removedSpaceCurrentColumnName}FilterConditions;
  _count?: Gassma${sheetName}${removedSpaceCurrentColumnName}FilterConditions;
  _max?: Gassma${sheetName}${removedSpaceCurrentColumnName}FilterConditions;
  _min?: Gassma${sheetName}${removedSpaceCurrentColumnName}FilterConditions;
  _sum?: Gassma${sheetName}${removedSpaceCurrentColumnName}FilterConditions;
} & Gassma${sheetName}${removedSpaceCurrentColumnName}FilterConditions;
`;

    return pre + oneHavingCoreType;
  }, "");

  return oneHavingCore;
};

export { getOneGassmaHavingCore };
