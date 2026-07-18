import { skipOptionalWrap, skipUnion } from "../util/skipUnion";

const getOneGassmaFindFirstData = (
  schemaName: string,
  sheetName: string,
  strict?: boolean,
) => {
  const sk = skipUnion(strict);
  const cursorType = skipOptionalWrap(
    `Partial<Gassma${schemaName}${sheetName}Use>`,
    strict,
  );
  const selectType = `Gassma${schemaName}${sheetName}FindSelect`;
  const omitType = `Gassma${schemaName}${sheetName}Omit`;

  return `\nexport type Gassma${schemaName}${sheetName}FindFirstData = {
  where?: Gassma${schemaName}${sheetName}WhereUse${sk};
  orderBy?: Gassma${schemaName}${sheetName}OrderBy | Gassma${schemaName}${sheetName}OrderBy[]${sk};
  include?: Gassma${schemaName}${sheetName}Include${sk};
  cursor?: ${cursorType}${sk};
  _count?: Gassma${schemaName}${sheetName}CountValue${sk};
} & ({ select?: ${selectType}${sk}; omit?: never } | { select?: never; omit?: ${omitType}${sk} });\n`;
};

export { getOneGassmaFindFirstData };
