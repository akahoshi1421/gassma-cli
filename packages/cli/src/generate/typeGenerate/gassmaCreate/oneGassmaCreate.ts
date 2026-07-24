import type { RelationsConfig } from "../../read/extractRelations";
import { buildCreateDataType } from "../util/buildCreateDataType";
import { skipUnion } from "../util/skipUnion";

const getOneGassmaCreate = (
  schemaName: string,
  sheetName: string,
  relations?: RelationsConfig,
  strict?: boolean,
) => {
  const sk = skipUnion(strict);
  const dataType = buildCreateDataType(
    schemaName,
    sheetName,
    relations,
    strict,
  );

  const selectType = `Gassma${schemaName}${sheetName}Select`;
  const omitType = `Gassma${schemaName}${sheetName}Omit`;

  return `
export type Gassma${schemaName}${sheetName}CreateData = {
  data: ${dataType};
  include?: Gassma${schemaName}${sheetName}Include${sk};
} & ({ select?: ${selectType}${sk}; omit?: never } | { select?: never; omit?: ${omitType}${sk} });
`;
};

export { getOneGassmaCreate };
