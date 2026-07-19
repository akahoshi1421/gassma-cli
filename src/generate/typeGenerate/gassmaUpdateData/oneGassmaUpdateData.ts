import { skipUnion } from "../util/skipUnion";

const getOneGassmaUpdateData = (
  schemaName: string,
  sheetName: string,
  strict?: boolean,
) => {
  const sk = skipUnion(strict);
  const dataType = `Partial<{ [K in keyof Gassma${schemaName}${sheetName}Use]: Gassma${schemaName}${sheetName}Use[K] | Gassma.NumberOperation${sk} }>`;

  return `
export type Gassma${schemaName}${sheetName}UpdateData = {
  where?: Gassma${schemaName}${sheetName}WhereUse${sk};
  data: ${dataType};
  limit?: number${sk};
};
`;
};

export { getOneGassmaUpdateData };
