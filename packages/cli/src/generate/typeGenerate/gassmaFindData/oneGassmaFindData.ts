import { getDistinctUnion } from "../util/distinctUnion";
import { skipOptionalWrap, skipUnion } from "../util/skipUnion";

const getOneGassmaFindData = (
  sheetContent: Record<string, unknown[]>,
  schemaName: string,
  sheetName: string,
  strict?: boolean,
) => {
  const distinctType = getDistinctUnion(sheetContent);

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
  distinct?: ${distinctType}${sk};
  include?: Gassma${schemaName}${sheetName}Include${sk};
  cursor?: ${cursorType}${sk};
  _count?: Gassma${schemaName}${sheetName}CountValue${sk};
} & ({ select?: ${selectType}${sk}; omit?: never } | { select?: never; omit?: ${omitType}${sk} });\n`;
};

export { getOneGassmaFindData };
