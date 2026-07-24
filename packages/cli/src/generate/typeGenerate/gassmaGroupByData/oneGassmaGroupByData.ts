import { skipUnion } from "../util/skipUnion";

const getOneGassmaGroupByData = (
  sheetContent: Record<string, unknown[]>,
  schemaName: string,
  sheetName: string,
  strict?: boolean,
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

  const sk = skipUnion(strict);

  return `\nexport type Gassma${schemaName}${sheetName}GroupByData = Omit<Gassma${schemaName}${sheetName}AggregateData, "cursor"> & {
  by: ${byData}(${byArrayData})[];
  having?: Gassma${schemaName}${sheetName}HavingUse${sk};
};
`;
};

export { getOneGassmaGroupByData };
