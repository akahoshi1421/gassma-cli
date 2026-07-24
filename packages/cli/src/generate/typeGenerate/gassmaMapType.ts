const stripOptional = (key: string) =>
  key.endsWith("?") ? key.slice(0, -1) : key;

const getGassmaMapType = (
  dictYaml: Record<string, Record<string, unknown[]>>,
  schemaName: string,
): string => {
  const modelNames = Object.keys(dictYaml);
  const typeName = `Gassma${schemaName}MapConfig`;

  if (modelNames.length === 0) {
    return `export type ${typeName} = {};\n`;
  }

  const body = modelNames.reduce((pre, modelName) => {
    const fields = dictYaml[modelName];
    if (!fields) return pre;

    const fieldEntries = Object.keys(fields)
      .map((key) => `      "${stripOptional(key)}"?: string;`)
      .join("\n");

    return `${pre}  "${modelName}"?: {\n${fieldEntries}\n  };\n`;
  }, "");

  return `export type ${typeName} = {\n${body}};\n`;
};

export { getGassmaMapType };
