import { generateColumnUnionConfig } from "./generateColumnUnionConfig";

const getGassmaIgnoreType = (
  dictYaml: Record<string, Record<string, unknown[]>>,
  schemaName: string,
): string => {
  const allModels = Object.keys(dictYaml);
  return generateColumnUnionConfig(
    dictYaml,
    allModels,
    `Gassma${schemaName}IgnoreConfig`,
  );
};

export { getGassmaIgnoreType };
