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

  const s = `Gassma${schemaName}${sheetName}Select`;
  const o = `Gassma${schemaName}${sheetName}Omit`;

  return `\ndeclare type Gassma${schemaName}${sheetName}FindData = {
  where?: Gassma${schemaName}${sheetName}WhereUse;
  orderBy?: Gassma${schemaName}${sheetName}OrderBy;
  take?: number;
  skip?: number;
  distinct?: ${distinctData}(${distinctArrayData})[];
  include?: Gassma${schemaName}${sheetName}Include;
  cursor?: Partial<Gassma${schemaName}${sheetName}Use>;
  _count?: Gassma${schemaName}${sheetName}CountValue;
} & ({ select?: ${s}; omit?: never } | { select?: never; omit?: ${o} });\n`;
};

export { getOneGassmaFindData };
