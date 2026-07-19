const getDistinctUnion = (sheetContent: Record<string, unknown[]>): string => {
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

  return `${distinctData}(${distinctArrayData})[]`;
};

export { getDistinctUnion };
