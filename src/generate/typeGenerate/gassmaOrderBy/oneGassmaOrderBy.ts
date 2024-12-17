const getOneGassmaOrderBy = (
  sheetContent: Record<string, unknown[]>,
  sheetName: string
) => {
  const oneAnyUse = Object.keys(sheetContent).reduce((pre, columName) => {
    const isQuestionMark = columName.at(-1) === "?";
    const removedQuestionMark = isQuestionMark
      ? columName.substring(0, columName.length - 1)
      : columName;

    return `${pre}  "${removedQuestionMark}"?: "asc" | "desc";\n`;
  }, `\nexport type Gassma${sheetName}OrderBy = {\n`);

  return `${oneAnyUse}};\n`;
};

export { getOneGassmaOrderBy };
