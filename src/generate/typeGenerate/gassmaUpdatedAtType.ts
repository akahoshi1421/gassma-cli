const stripOptional = (key: string) =>
  key.endsWith("?") ? key.slice(0, -1) : key;

const getGassmaUpdatedAtType = (
  dictYaml: Record<string, Record<string, unknown[]>>,
  updatedAtModels: string[],
  schemaName: string,
): string => {
  if (updatedAtModels.length === 0) {
    return `declare type Gassma${schemaName}UpdatedAtConfig = {};\n`;
  }

  const body = updatedAtModels.reduce((pre, modelName) => {
    const fields = dictYaml[modelName];
    if (!fields) return pre;

    const columnNames = Object.keys(fields).map(
      (key) => `"${stripOptional(key)}"`,
    );
    const union = columnNames.join(" | ");

    return `${pre}  "${modelName}"?: ${union} | (${union})[];\n`;
  }, "");

  return `declare type Gassma${schemaName}UpdatedAtConfig = {\n${body}};\n`;
};

export { getGassmaUpdatedAtType };
