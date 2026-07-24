import {
  EXTENSION_OPERATIONS,
  type ExtensionOperation,
  toUnion,
} from "./extensionOperations";

const getGenericHook = (
  operation: ExtensionOperation,
  self: string,
  sheetName: string,
) => {
  const result = operation.result(self);
  return `  ${operation.name}?: <T extends ${self}${operation.dataSuffix}>(params: {
    model: "${sheetName}";
    operation: "${operation.name}";
    args: T;
    query: (args: T) => ${result};
  }) => ${result};`;
};

const getFixedHook = (
  operation: ExtensionOperation,
  self: string,
  sheetName: string,
) => {
  const result = operation.result(self);
  const data = `${self}${operation.dataSuffix}`;
  return `  ${operation.name}?: (params: {
    model: "${sheetName}";
    operation: "${operation.name}";
    args: ${data};
    query: (args: ${data}) => ${result};
  }) => ${result};`;
};

const getOneGassmaExtension = (
  schemaName: string,
  sheetName: string,
  cleanSheetName: string,
) => {
  const self = `Gassma${schemaName}${cleanSheetName}`;

  const argsUnion = toUnion(
    EXTENSION_OPERATIONS.map((operation) => `${self}${operation.dataSuffix}`),
  );

  const hooks = EXTENSION_OPERATIONS.map((operation) =>
    operation.generic
      ? getGenericHook(operation, self, sheetName)
      : getFixedHook(operation, self, sheetName),
  ).join("\n");

  return `
export type ${self}QueryArgs =
${argsUnion};

export type ${self}QueryHooks<GO extends ${self}Omit = {}, O = {}> = {
${hooks}
  $allOperations?: (params: {
    model: "${sheetName}";
    operation: Gassma${schemaName}OperationName;
    args: ${self}QueryArgs;
    query: (args: ${self}QueryArgs) => unknown;
  }) => unknown;
};
`;
};

export { getOneGassmaExtension };
