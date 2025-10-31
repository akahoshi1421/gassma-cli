const getOneGassmaGroupByData = (
  sheetContent: Record<string, unknown[]>,
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

  return `\nexport type Gassma${sheetName}GroupByData = Gassma${sheetName}AggregateData & {
  by: ${byData}(${byArrayData})[];
  having?: Gassma${sheetName}HavingUse;
};
`;
};

export { getOneGassmaGroupByData };
