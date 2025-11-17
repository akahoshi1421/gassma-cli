const getOneGassmaOrderBy = (
  sheetContent: Record<string, unknown[]>,
  sheetName: string,
) => {
  const oneAnyUse = Object.keys(sheetContent).reduce((pre, columnName) => {
    const isQuestionMark = columnName.at(-1) === "?";
    const removedQuestionMark = isQuestionMark
      ? columnName.substring(0, columnName.length - 1)
      : columnName;

    return `${pre}  "${removedQuestionMark}"?: "asc" | "desc";\n`;
  }, `\ndeclare type Gassma${sheetName}OrderBy = {\n`);

  return `${oneAnyUse}};\n`;
};

export { getOneGassmaOrderBy };
