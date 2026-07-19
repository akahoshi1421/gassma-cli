import { buildUpdateDataType } from "../util/buildUpdateDataType";
import { skipUnion } from "../util/skipUnion";

const getOneGassmaUpdateData = (
  schemaName: string,
  sheetName: string,
  sheetContent: Record<string, unknown[]>,
  strict?: boolean,
) => {
  const sk = skipUnion(strict);
  const dataType = buildUpdateDataType(
    `Gassma${schemaName}${sheetName}Use`,
    sheetContent,
    strict,
  );

  return `
export type Gassma${schemaName}${sheetName}UpdateData = {
  where?: Gassma${schemaName}${sheetName}WhereUse${sk};
  data: ${dataType};
  limit?: number${sk};
};
`;
};

export { getOneGassmaUpdateData };
