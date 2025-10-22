const getOneGassmaFindData = (
  sheetContent: Record<string, unknown[]>,
  sheetName: string
) => {
  const distinctArrayData = Object.keys(sheetContent).reduce(
    (pre, columnName, index) => {
      const isQuestionMark = columnName.at(-1) === "?";
      const removedQuestionMark = isQuestionMark
        ? columnName.substring(0, columnName.length - 1)
        : columnName;

      return index !== Object.keys(sheetContent).length - 1
        ? `${pre}"${removedQuestionMark}" | `
        : `${pre}"${removedQuestionMark}"`;
    },
    ""
  );
  const distinctData = Object.keys(sheetContent).reduce((pre, columnName) => {
    const isQuestionMark = columnName.at(-1) === "?";
    const removedQuestionMark = isQuestionMark
      ? columnName.substring(0, columnName.length - 1)
      : columnName;

    return `${pre}"${removedQuestionMark}" | `;
  }, "");

  return `\nexport type Gassma${sheetName}FindData = {
  where?: Gassma${sheetName}WhereUse;
  select?: Gassma${sheetName}Select;
  omit?: Gassma${sheetName}Omit;
  orderBy?: Gassma${sheetName}OrderBy;
  take?: number;
  skip?: number;
  distinct?: ${distinctData}(${distinctArrayData})[]
};\n`;
};

export { getOneGassmaFindData };
