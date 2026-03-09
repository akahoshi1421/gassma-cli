const getOneGassmaFindData = (
  sheetContent: Record<string, unknown[]>,
  schemaName: string,
  sheetName: string,
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
    "",
  );
  const distinctData = Object.keys(sheetContent).reduce((pre, columnName) => {
    const isQuestionMark = columnName.at(-1) === "?";
    const removedQuestionMark = isQuestionMark
      ? columnName.substring(0, columnName.length - 1)
      : columnName;

    return `${pre}"${removedQuestionMark}" | `;
  }, "");

  return `\ndeclare type Gassma${schemaName}${sheetName}FindData = {
  where?: Gassma${schemaName}${sheetName}WhereUse;
  select?: Gassma${schemaName}${sheetName}Select;
  omit?: Gassma${schemaName}${sheetName}Omit;
  orderBy?: Gassma${schemaName}${sheetName}OrderBy;
  take?: number;
  skip?: number;
  distinct?: ${distinctData}(${distinctArrayData})[];
  include?: Gassma${schemaName}${sheetName}Include;
  cursor?: Partial<Gassma${schemaName}${sheetName}Use>;
  _count?: Gassma${schemaName}${sheetName}CountValue;
};\n`;
};

export { getOneGassmaFindData };
