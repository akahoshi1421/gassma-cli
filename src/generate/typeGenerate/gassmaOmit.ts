import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getOneGassmaOmit } from "./gassmaOmit/oneGassmaOmit";

const getGassmaOmit = (
  dictYaml: Record<string, Record<string, unknown[]>>,
  schemaName: string,
) => {
  const omitDeclare = Object.keys(dictYaml).reduce((pre, currentSheetName) => {
    const sheetContent = dictYaml[currentSheetName];
    const removedSpaceCurrentSheetName =
      getRemovedCantUseVarChar(currentSheetName);

    return (
      pre +
      getOneGassmaOmit(sheetContent, schemaName, removedSpaceCurrentSheetName)
    );
  }, "");

  return omitDeclare;
};

export { getGassmaOmit };
