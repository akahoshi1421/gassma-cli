import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaGroupByKeyOfBaseReturn } from "./gassmaGroupByKeyOfBaseReturn/oneGassmaGroupByKeyOfBaseReturn";

const getGassmaGroupByKeyOfBaseReturn = (
  sheetNames: string[],
  schemaName: string,
) => {
  const groupByKeyOfBaseReturn = sheetNames.reduce((pre, currentSheetName) => {
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return (
      pre +
      getOneGassmaGroupByKeyOfBaseReturn(
        schemaName,
        removedSpaceCurrentSheetName,
      )
    );
  }, "");

  return groupByKeyOfBaseReturn;
};

export { getGassmaGroupByKeyOfBaseReturn };
