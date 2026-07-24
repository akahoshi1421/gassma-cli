import { getRemovedCantUseVarChar } from "../../util/getRemovedCantUseVarChar";
import { EXTENSION_OPERATIONS, toUnion } from "./extensionOperations";

const getGassmaAllModelsQueryHooks = (
  sheetNames: string[],
  schemaName: string,
) => {
  const prefix = `Gassma${schemaName}`;
  const selfOf = (sheetName: string) =>
    `${prefix}${getRemovedCantUseVarChar(sheetName)}`;

  const hooks = EXTENSION_OPERATIONS.map((operation) => {
    const argsType = sheetNames
      .map((sheetName) => `${selfOf(sheetName)}${operation.dataSuffix}`)
      .join(" | ");
    return `  ${operation.name}?: (params: {
    model: ${prefix}ModelName;
    operation: "${operation.name}";
    args: ${argsType};
    query: (args: ${argsType}) => unknown;
  }) => unknown;`;
  }).join("\n");

  const queryArgsUnion = toUnion(
    sheetNames.map((sheetName) => `${selfOf(sheetName)}QueryArgs`),
  );

  return `
export type ${prefix}QueryArgs =
${queryArgsUnion};

export type ${prefix}AllModelsQueryHooks = {
${hooks}
  $allOperations?: (params: {
    model: ${prefix}ModelName;
    operation: ${prefix}OperationName;
    args: ${prefix}QueryArgs;
    query: (args: ${prefix}QueryArgs) => unknown;
  }) => unknown;
};
`;
};

export { getGassmaAllModelsQueryHooks };
