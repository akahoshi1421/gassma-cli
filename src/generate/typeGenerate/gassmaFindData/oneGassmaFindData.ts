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

  const selectType = `Gassma${schemaName}${sheetName}Select`;
  const omitType = `Gassma${schemaName}${sheetName}Omit`;

  return `\nexport type Gassma${schemaName}${sheetName}FindData = {
  where?: Gassma${schemaName}${sheetName}WhereUse;
  orderBy?: Gassma${schemaName}${sheetName}OrderBy;
  take?: number;
  skip?: number;
  distinct?: ${distinctData}(${distinctArrayData})[];
  include?: Gassma${schemaName}${sheetName}Include;
  cursor?: Partial<Gassma${schemaName}${sheetName}Use>;
  _count?: Gassma${schemaName}${sheetName}CountValue;
} & ({ select?: ${selectType}; omit?: never } | { select?: never; omit?: ${omitType} });\n`;
};

export { getOneGassmaFindData };
