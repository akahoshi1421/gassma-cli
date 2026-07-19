import { skipOptionalWrap, skipUnion } from "../util/skipUnion";

const getOneGassmaFindData = (
  sheetContent: Record<string, unknown[]>,
  schemaName: string,
  sheetName: string,
  strict?: boolean,
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

  const sk = skipUnion(strict);
  const cursorType = skipOptionalWrap(
    `Partial<Gassma${schemaName}${sheetName}Use>`,
    strict,
  );
  const selectType = `Gassma${schemaName}${sheetName}FindSelect`;
  const omitType = `Gassma${schemaName}${sheetName}Omit`;

  return `\nexport type Gassma${schemaName}${sheetName}FindData = {
  where?: Gassma${schemaName}${sheetName}WhereUse${sk};
  orderBy?: Gassma${schemaName}${sheetName}OrderBy | Gassma${schemaName}${sheetName}OrderBy[]${sk};
  take?: number${sk};
  skip?: number${sk};
  distinct?: ${distinctData}(${distinctArrayData})[]${sk};
  include?: Gassma${schemaName}${sheetName}Include${sk};
  cursor?: ${cursorType}${sk};
  _count?: Gassma${schemaName}${sheetName}CountValue${sk};
} & ({ select?: ${selectType}${sk}; omit?: never } | { select?: never; omit?: ${omitType}${sk} });\n`;
};

export { getOneGassmaFindData };
