import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getSheetPropertyDoc } from "./tsdoc/docContext";

const getGassmaSheet = (sheetNames: string[], schemaName: string) => {
  const sheetTypeDeclare = sheetNames.reduce((pre, current) => {
    const clean = getRemovedCantUseVarChar(current);
    const doc = getSheetPropertyDoc(schemaName, current);

    return `${pre}${doc}  "${current}": Gassma${schemaName}${clean}Controller<O extends { "${current}": infer UO } ? UO extends Gassma${schemaName}${clean}Omit ? UO : {} : {}, O>;\n`;
  }, `export type Gassma${schemaName}Sheet<O extends Gassma${schemaName}GlobalOmitConfig = {}> = {\n`);

  return sheetTypeDeclare + "};\n";
};

export { getGassmaSheet };
