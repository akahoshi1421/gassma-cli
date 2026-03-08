import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaByField } from "./gassmaByField/oneGassmaByField";

const getGassmaByField = (sheetNames: string[], schemaName: string) => {
  const byFieldDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentColumnName =
      getRemovedCantUseVarChar(currentSheetName);

    return pre + getOneGassmaByField(schemaName, removedSpaceCurrentColumnName);
  }, "");

  return byFieldDeclare;
};

export { getGassmaByField };
