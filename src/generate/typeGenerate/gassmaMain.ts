import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getGassmaCommonTypes } from "./gassmaCommonTypes";
import { getGassmaErrorClasses } from "./gassmaErrorClasses";

const getGassmaGlobalOmitConfig = (sheetNames: string[]) => {
  const body = sheetNames.reduce((pre, sheetName) => {
    const cleanName = getRemovedCantUseVarChar(sheetName);
    return `${pre}  "${sheetName}"?: Gassma${cleanName}Omit;\n`;
  }, "");

  return `declare type GassmaGlobalOmitConfig = {\n${body}};\n`;
};

const getGassmaClientOptions = () => {
  return `declare type GassmaClientOptions = {
  id?: string;
  relations?: Gassma.RelationsConfig;
  omit?: GassmaGlobalOmitConfig;
};\n`;
};

const getGassmaMain = (sheetNames: string[]) => {
  const errorClasses = getGassmaErrorClasses();
  const commonTypes = getGassmaCommonTypes();

  const mainTypeDeclare = `declare namespace Gassma {
${commonTypes}
  class FieldRef {
    readonly modelName: string;
    readonly name: string;
    constructor(modelName: string, name: string);
  }

  class GassmaClient {
    constructor(idOrOptions?: string | GassmaClientOptions);

    readonly sheets: GassmaSheet;
  }

${errorClasses}}

`;

  return (
    mainTypeDeclare +
    getGassmaGlobalOmitConfig(sheetNames) +
    getGassmaClientOptions()
  );
};

export { getGassmaMain };
