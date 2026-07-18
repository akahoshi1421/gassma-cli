import { skipOptionalWrap, skipUnion } from "../util/skipUnion";

const getOneGassmaAggregateData = (
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
export type Gassma${schemaName}${sheetName}AggregateData = {
  where?: Gassma${schemaName}${sheetName}WhereUse${sk};
  orderBy?: Gassma${schemaName}${sheetName}OrderBy | Gassma${schemaName}${sheetName}OrderBy[]${sk};
  take?: number${sk};
  skip?: number${sk};
  cursor?: ${cursorType}${sk};
  _avg?: Gassma${schemaName}${sheetName}NumberSelect${sk};
  _count?: Gassma${schemaName}${sheetName}Select${sk};
  _max?: Gassma${schemaName}${sheetName}Select${sk};
  _min?: Gassma${schemaName}${sheetName}Select${sk};
  _sum?: Gassma${schemaName}${sheetName}NumberSelect${sk};
};
`;
};

export { getOneGassmaAggregateData };
