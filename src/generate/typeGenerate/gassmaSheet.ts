import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";

const getGassmaSheet = (sheetNames: string[]) => {
  const sheetTypeDeclare = sheetNames.reduce((pre, current) => {
    const removedSpaceCurrentSheetName = getRemovedCantUseVarChar(current);

    return `${pre}  "${current}": Gassma${removedSpaceCurrentSheetName}Controller;\n`;
  }, "declare type GassmaSheet = {\n");

  return sheetTypeDeclare + "};\n";
};

export { getGassmaSheet };
