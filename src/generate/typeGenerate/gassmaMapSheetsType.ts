const getGassmaMapSheetsType = (
  dictYaml: Record<string, Record<string, unknown[]>>,
  schemaName: string,
): string => {
  const modelNames = Object.keys(dictYaml);
  const typeName = `Gassma${schemaName}MapSheetsConfig`;

  if (modelNames.length === 0) {
    return `export type ${typeName} = {};\n`;
  }

  const body = modelNames.map((name) => `  "${name}"?: string;`).join("\n");

  return `export type ${typeName} = {\n${body}\n};\n`;
};

export { getGassmaMapSheetsType };
