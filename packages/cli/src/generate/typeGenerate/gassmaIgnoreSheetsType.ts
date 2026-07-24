const getGassmaIgnoreSheetsType = (
  dictYaml: Record<string, Record<string, unknown[]>>,
  schemaName: string,
): string => {
  const modelNames = Object.keys(dictYaml);
  const typeName = `Gassma${schemaName}IgnoreSheetsConfig`;

  if (modelNames.length === 0) {
    return `export type ${typeName} = never;\n`;
  }

  const union = modelNames.map((name) => `"${name}"`).join(" | ");

  return `export type ${typeName} = ${union} | (${union})[];\n`;
};

export { getGassmaIgnoreSheetsType };
