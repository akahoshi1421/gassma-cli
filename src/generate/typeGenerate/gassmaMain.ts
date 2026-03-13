import type { DefaultsConfig } from "../read/extractDefaults";
import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getGassmaCommonTypes } from "./gassmaCommonTypes";
import { getGassmaDefaultsType } from "./gassmaDefaultsType";
import { getGassmaErrorClasses } from "./gassmaErrorClasses";
import { getGassmaIgnoreType } from "./gassmaIgnoreType";
import { getGassmaIgnoreSheetsType } from "./gassmaIgnoreSheetsType";
import { getGassmaMapType } from "./gassmaMapType";
import { getGassmaMapSheetsType } from "./gassmaMapSheetsType";
import { getGassmaAutoincrementType } from "./gassmaAutoincrementType";
import { getGassmaUpdatedAtType } from "./gassmaUpdatedAtType";

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
  defaults?: Gassma${schemaName}DefaultsConfig;
  updatedAt?: Gassma${schemaName}UpdatedAtConfig;
  autoincrement?: Gassma${schemaName}AutoincrementConfig;
  ignore?: Gassma${schemaName}IgnoreConfig;
  ignoreSheets?: Gassma${schemaName}IgnoreSheetsConfig;
  map?: Gassma${schemaName}MapConfig;
  mapSheets?: Gassma${schemaName}MapSheetsConfig;
};\n\n`;
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

type GassmaMainOptions = {
  dictYaml: Record<string, Record<string, unknown[]>>;
  defaults: DefaultsConfig;
  updatedAtModels: string[];
  autoincrementModels: string[];
};

const getGassmaSchemaClient = (
  sheetNames: string[],
  schemaName: string,
  options: GassmaMainOptions,
) => {
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
    "\n" +
    getGassmaDefaultsType(options.dictYaml, options.defaults, schemaName) +
    "\n" +
    getGassmaUpdatedAtType(
      options.dictYaml,
      options.updatedAtModels,
      schemaName,
    ) +
    "\n" +
    getGassmaIgnoreType(options.dictYaml, schemaName) +
    "\n" +
    getGassmaIgnoreSheetsType(options.dictYaml, schemaName) +
    "\n" +
    getGassmaMapType(options.dictYaml, schemaName) +
    "\n" +
    getGassmaMapSheetsType(options.dictYaml, schemaName) +
    "\n" +
    getGassmaAutoincrementType(
      options.dictYaml,
      options.autoincrementModels,
      schemaName,
    ) +
    "\n" +
    getGassmaClientOptions(schemaName)
  );
};

const getGassmaMain = (
  sheetNames: string[],
  schemaName: string,
  includeCommon?: boolean,
  options?: GassmaMainOptions,
) => {
  const common = includeCommon !== false ? getGassmaCommonNamespace() : "";
  const mainOptions = options ?? {
    dictYaml: {},
    defaults: {},
    updatedAtModels: [],
    autoincrementModels: [],
  };

  return common + getGassmaSchemaClient(sheetNames, schemaName, mainOptions);
};

export { getGassmaMain, getGassmaCommonNamespace };
