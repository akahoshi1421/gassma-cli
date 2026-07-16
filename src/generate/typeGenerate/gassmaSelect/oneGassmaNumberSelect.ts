const getOneGassmaNumberSelect = (
  sheetContent: Record<string, unknown[]>,
  schemaName: string,
  sheetName: string,
) => {
  const numberColumnNames = Object.keys(sheetContent).filter((columnName) =>
    sheetContent[columnName].some((oneType) => oneType === "number"),
  );

  const typeName = `Gassma${schemaName}${sheetName}NumberSelect`;

  if (numberColumnNames.length === 0) {
    return `\nexport type ${typeName} = Record<string, never>;\n`;
  }

  const oneSelect = numberColumnNames.reduce((pre, columnName) => {
    const isQuestionMark = columnName.at(-1) === "?";
    const removedQuestionMark = isQuestionMark
      ? columnName.substring(0, columnName.length - 1)
      : columnName;

    return `${pre}  "${removedQuestionMark}"?: true;\n`;
  }, `\nexport type ${typeName} = {\n`);

  return `${oneSelect}};\n`;
};

export { getOneGassmaNumberSelect };
