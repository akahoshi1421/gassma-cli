const stripOptional = (key: string) =>
  key.endsWith("?") ? key.slice(0, -1) : key;

const generateColumnUnionConfig = (
  dictYaml: Record<string, Record<string, unknown[]>>,
  modelNames: string[],
  typeName: string,
): string => {
  if (modelNames.length === 0) {
    return `export type ${typeName} = {};\n`;
  }

  const body = modelNames.reduce((pre, modelName) => {
    const fields = dictYaml[modelName];
    if (!fields) return pre;

    const columnNames = Object.keys(fields).map(
      (key) => `"${stripOptional(key)}"`,
    );
    const union = columnNames.join(" | ");

    return `${pre}  "${modelName}"?: ${union} | (${union})[];\n`;
  }, "");

  return `export type ${typeName} = {\n${body}};\n`;
};

export { generateColumnUnionConfig };
