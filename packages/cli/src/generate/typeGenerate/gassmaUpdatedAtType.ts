import { generateColumnUnionConfig } from "./generateColumnUnionConfig";

const getGassmaUpdatedAtType = (
  dictYaml: Record<string, Record<string, unknown[]>>,
  updatedAtModels: string[],
  schemaName: string,
): string => {
  return generateColumnUnionConfig(
    dictYaml,
    updatedAtModels,
    `Gassma${schemaName}UpdatedAtConfig`,
  );
};

export { getGassmaUpdatedAtType };
