import { generateColumnUnionConfig } from "./generateColumnUnionConfig";

const getGassmaAutoincrementType = (
  dictYaml: Record<string, Record<string, unknown[]>>,
  autoincrementModels: string[],
  schemaName: string,
): string => {
  return generateColumnUnionConfig(
    dictYaml,
    autoincrementModels,
    `Gassma${schemaName}AutoincrementConfig`,
  );
};

export { getGassmaAutoincrementType };
