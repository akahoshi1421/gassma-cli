import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";

const getGassmaSheet = (sheetNames: string[], schemaName: string) => {
  const sheetTypeDeclare = sheetNames.reduce((pre, current) => {
    const clean = getRemovedCantUseVarChar(current);

    return `${pre}  "${current}": Gassma${schemaName}${clean}Controller<O extends { "${current}": infer UO } ? UO extends Gassma${schemaName}${clean}Omit ? UO : {} : {}>;\n`;
  }, `declare type Gassma${schemaName}Sheet<O extends Gassma${schemaName}GlobalOmitConfig = {}> = {\n`);

  return sheetTypeDeclare + "};\n";
};

export { getGassmaSheet };
