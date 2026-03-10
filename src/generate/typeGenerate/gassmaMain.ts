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
  return `declare type Gassma${schemaName}ClientOptions<O extends Gassma${schemaName}GlobalOmitConfig = {}> = {
  id?: string;
  relations?: Gassma.RelationsConfig;
  omit?: O;
  defaults?: Gassma.DefaultsConfig;
  updatedAt?: Gassma.UpdatedAtConfig;
};\n`;
};

const getGassmaCommonNamespace = () => {
  const commonTypes = getGassmaCommonTypes();
  const errorClasses = getGassmaErrorClasses();

  return `declare namespace Gassma {
${commonTypes}
  interface GassmaClientMap {}

  class GassmaClient<T extends keyof GassmaClientMap> {
    constructor(idOrOptions?: string | GassmaClientMap[T]["options"]);
    readonly sheets: GassmaClientMap[T]["sheets"];
  }

  class FieldRef {
    readonly modelName: string;
    readonly name: string;
    constructor(modelName: string, name: string);
  }

${errorClasses}}

`;
};

const getGassmaSchemaClient = (sheetNames: string[], schemaName: string) => {
  const clientMapEntry = `declare namespace Gassma {
  interface GassmaClientMap {
    "${schemaName}": {
      sheets: Gassma${schemaName}Sheet;
      options: Gassma${schemaName}ClientOptions;
      globalOmitConfig: Gassma${schemaName}GlobalOmitConfig;
    };
  }
}

`;

  return (
    clientMapEntry +
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
