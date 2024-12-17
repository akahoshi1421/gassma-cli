import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";

const getGassmaSheet = (sheetNames: string[]) => {
  const sheetTypeDeclare = sheetNames.reduce((pre, current) => {
    const removeedSpaceCurrentSheetName = getRemovedCantUseVarChar(current);

    return `${pre}  "${current}": Gassma${removeedSpaceCurrentSheetName}Controller;\n`;
  }, "export type GassmaSheet = {\n");

  return sheetTypeDeclare + "};\n";
};

export { getGassmaSheet };
