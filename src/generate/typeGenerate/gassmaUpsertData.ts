import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaUpsertData } from "./gassmaUpsertData/oneGassmaUpsertData";

const getGassmaUpsertData = (sheetNames: string[], schemaName: string) => {
  const upsertDataDeclare = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return (
      pre + getOneGassmaUpsertData(schemaName, removedSpaceCurrentSheetName)
    );
  }, "");

  return upsertDataDeclare;
};

export { getGassmaUpsertData };
