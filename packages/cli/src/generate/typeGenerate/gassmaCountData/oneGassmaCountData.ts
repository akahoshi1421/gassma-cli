import { skipOptionalWrap, skipUnion } from "../util/skipUnion";

const getOneGassmaCountData = (
  schemaName: string,
  sheetName: string,
  strict?: boolean,
) => {
  const sk = skipUnion(strict);
  const cursorType = skipOptionalWrap(
    `Partial<Gassma${schemaName}${sheetName}Use>`,
    strict,
  );

  return `
export type Gassma${schemaName}${sheetName}CountData = {
  where?: Gassma${schemaName}${sheetName}WhereUse${sk};
  orderBy?: Gassma${schemaName}${sheetName}OrderBy | Gassma${schemaName}${sheetName}OrderBy[]${sk};
  take?: number${sk};
  skip?: number${sk};
  cursor?: ${cursorType}${sk};
};
`;
};

export { getOneGassmaCountData };
