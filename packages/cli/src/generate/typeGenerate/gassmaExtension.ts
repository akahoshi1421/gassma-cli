import { getRemovedCantUseVarChar } from "../util/getRemovedCantUseVarChar";
import { getGassmaAllModelsQueryHooks } from "./gassmaExtension/allModelsQueryHooks";
import {
  EXTENSION_OPERATIONS,
  toUnion,
} from "./gassmaExtension/extensionOperations";
import { getOneGassmaExtension } from "./gassmaExtension/oneGassmaExtension";
import { getGassmaResultExtension } from "./gassmaExtension/resultExtension";

const getGassmaExtension = (sheetNames: string[], schemaName: string) => {
  const prefix = `Gassma${schemaName}`;

  const modelNameUnion = toUnion(
    sheetNames.map((sheetName) => `"${sheetName}"`),
  );
  const operationNameUnion = toUnion(
    EXTENSION_OPERATIONS.map((operation) => `"${operation.name}"`),
  );

  const perSheet = sheetNames.reduce((pre, sheetName) => {
    return (
      pre +
      getOneGassmaExtension(
        schemaName,
        sheetName,
        getRemovedCantUseVarChar(sheetName),
      )
    );
  }, "");

  const queryExtensionEntries = sheetNames
    .map((sheetName) => {
      const self = `${prefix}${getRemovedCantUseVarChar(sheetName)}`;
      const go = `O extends { "${sheetName}": infer UO } ? UO extends ${self}Omit ? UO : {} : {}`;
      return `  "${sheetName}"?: ${self}QueryHooks<${go}, O>;`;
    })
    .join("\n");

  return `
export type ${prefix}ModelName =
${modelNameUnion};

export type ${prefix}OperationName =
${operationNameUnion};
${perSheet}${getGassmaAllModelsQueryHooks(sheetNames, schemaName)}
export type ${prefix}QueryExtension<O extends ${prefix}GlobalOmitConfig = {}> = {
${queryExtensionEntries}
  $allModels?: ${prefix}AllModelsQueryHooks;
};
${getGassmaResultExtension(sheetNames, schemaName)}
export type ${prefix}Extension<O extends ${prefix}GlobalOmitConfig = {}> = {
  query?: ${prefix}QueryExtension<O>;
  result?: ${prefix}ResultConfig;
};
`;
};

export { getGassmaExtension };
