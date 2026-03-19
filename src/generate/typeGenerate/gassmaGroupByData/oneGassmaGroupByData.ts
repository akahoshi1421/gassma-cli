const getOneGassmaGroupByData = (
  sheetContent: Record<string, unknown[]>,
  schemaName: string,
  sheetName: string,
) => {
  const byArrayData = Object.keys(sheetContent).reduce(
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
  const byData = Object.keys(sheetContent).reduce((pre, columnName) => {
    const isQuestionMark = columnName.at(-1) === "?";
    const removedQuestionMark = isQuestionMark
      ? columnName.substring(0, columnName.length - 1)
      : columnName;

    return `${pre}"${removedQuestionMark}" | `;
  }, "");

  return `\nexport type Gassma${schemaName}${sheetName}GroupByData = Gassma${schemaName}${sheetName}AggregateData & {
  by: ${byData}(${byArrayData})[];
  having?: Gassma${schemaName}${sheetName}HavingUse;
};
`;
};

export { getOneGassmaGroupByData };
