import { skipUnion } from "../util/skipUnion";

const getOneGassmaDeleteData = (
  schemaName: string,
  sheetName: string,
  strict?: boolean,
) => {
  const sk = skipUnion(strict);

  return `
export type Gassma${schemaName}${sheetName}DeleteData = {
  where?: Gassma${schemaName}${sheetName}WhereUse${sk};
  limit?: number${sk};
};
`;
};

export { getOneGassmaDeleteData };
