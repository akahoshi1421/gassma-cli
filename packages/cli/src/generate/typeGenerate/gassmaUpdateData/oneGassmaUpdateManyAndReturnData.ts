import { buildUpdateDataType } from "../util/buildUpdateDataType";
import { skipUnion } from "../util/skipUnion";

const getOneGassmaUpdateManyAndReturnData = (
  schemaName: string,
  sheetName: string,
  sheetContent: Record<string, unknown[]>,
  strict?: boolean,
) => {
  const sk = skipUnion(strict);
  const self = `Gassma${schemaName}${sheetName}`;
  const dataType = buildUpdateDataType(`${self}Use`, sheetContent, strict);

  return `
export type ${self}UpdateManyAndReturnData = {
  where?: ${self}WhereUse${sk};
  data: ${dataType};
  limit?: number${sk};
  include?: ${self}Include${sk};
} & ({ select?: ${self}Select${sk}; omit?: never } | { select?: never; omit?: ${self}Omit${sk} });
`;
};

export { getOneGassmaUpdateManyAndReturnData };
