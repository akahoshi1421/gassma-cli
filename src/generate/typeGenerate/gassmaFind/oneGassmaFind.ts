const getOneGassmaFind = (
  sheetContent: Record<string, unknown[]>,
  sheetName: string
) => {
  const oneFind = Object.keys(sheetContent).reduce((pre, columnName) => {
    const isQuestionMark = columnName.at(-1) === "?";
    const removedQuestionMark = isQuestionMark
      ? columnName.substring(0, columnName.length - 1)
      : columnName;

    return `${pre}  "${removedQuestionMark}"?: true;\n`;
  }, `\nexport type Gassma${sheetName}Select = {\n`);

  return `${oneFind}};\n`;
};

export { getOneGassmaFind };
