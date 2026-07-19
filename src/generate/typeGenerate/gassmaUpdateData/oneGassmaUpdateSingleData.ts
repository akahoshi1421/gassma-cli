import type { RelationsConfig } from "../../read/extractRelations";
import { getNestedWriteFields } from "../util/getNestedWriteFields";
import { skipUnion } from "../util/skipUnion";

const getOneGassmaUpdateSingleData = (
  schemaName: string,
  sheetName: string,
  relations?: RelationsConfig,
  strict?: boolean,
) => {
  const sk = skipUnion(strict);
  const nestedFields = getNestedWriteFields(
    schemaName,
    sheetName,
    relations,
    "update",
    strict,
  );
  const baseDataType = `Partial<{ [K in keyof Gassma${schemaName}${sheetName}Use]: Gassma${schemaName}${sheetName}Use[K] | Gassma.NumberOperation${sk} }>`;
  const dataType = nestedFields
    ? `${baseDataType} & {\n${nestedFields}  }`
    : baseDataType;

  const selectType = `Gassma${schemaName}${sheetName}Select`;
  const omitType = `Gassma${schemaName}${sheetName}Omit`;

  return `
export type Gassma${schemaName}${sheetName}UpdateSingleData = {
  where: Gassma${schemaName}${sheetName}WhereUse;
  data: ${dataType};
  include?: Gassma${schemaName}${sheetName}Include${sk};
} & ({ select?: ${selectType}${sk}; omit?: never } | { select?: never; omit?: ${omitType}${sk} });
`;
};

export { getOneGassmaUpdateSingleData };
