import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";

const getGassmaSheet = (sheetNames: string[], schemaName: string) => {
  const sheetTypeDeclare = sheetNames.reduce((pre, current) => {
    const removedSpaceCurrentSheetName = getRemovedCantUseVarChar(current);

    return `${pre}  "${current}": Gassma${schemaName}${removedSpaceCurrentSheetName}Controller;\n`;
  }, `declare type Gassma${schemaName}Sheet = {\n`);

  return sheetTypeDeclare + "};\n";
};

export { getGassmaSheet };
