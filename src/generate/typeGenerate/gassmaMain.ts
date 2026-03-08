import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getGassmaCommonTypes } from "./gassmaCommonTypes";
import { getGassmaErrorClasses } from "./gassmaErrorClasses";

const getGassmaGlobalOmitConfig = (
  sheetNames: string[],
  schemaName: string,
) => {
  const body = sheetNames.reduce((pre, sheetName) => {
    const cleanName = getRemovedCantUseVarChar(sheetName);
    return `${pre}  "${sheetName}"?: Gassma${schemaName}${cleanName}Omit;\n`;
  }, "");

  return `declare type Gassma${schemaName}GlobalOmitConfig = {\n${body}};\n`;
};

const getGassmaClientOptions = (schemaName: string) => {
  return `declare type Gassma${schemaName}ClientOptions = {
  id?: string;
  relations?: Gassma.RelationsConfig;
  omit?: Gassma${schemaName}GlobalOmitConfig;
};\n`;
};

const getGassmaCommonNamespace = () => {
  const commonTypes = getGassmaCommonTypes();
  const errorClasses = getGassmaErrorClasses();

  return `declare namespace Gassma {
${commonTypes}
  class FieldRef {
    readonly modelName: string;
    readonly name: string;
    constructor(modelName: string, name: string);
  }

${errorClasses}}

`;
};

const getGassmaSchemaClient = (sheetNames: string[], schemaName: string) => {
  const clientDeclare = `declare namespace Gassma {
  class Gassma${schemaName}Client {
    constructor(idOrOptions?: string | Gassma${schemaName}ClientOptions);
    readonly sheets: Gassma${schemaName}Sheet;
  }
}

`;

  return (
    clientDeclare +
    getGassmaGlobalOmitConfig(sheetNames, schemaName) +
    getGassmaClientOptions(schemaName)
  );
};

const getGassmaMain = (
  sheetNames: string[],
  schemaName: string,
  includeCommon?: boolean,
) => {
  const common = includeCommon !== false ? getGassmaCommonNamespace() : "";

  return common + getGassmaSchemaClient(sheetNames, schemaName);
};

export { getGassmaMain, getGassmaCommonNamespace };
