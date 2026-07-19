import type { RelationsConfig } from "../../read/extractRelations";
import { buildUpdateDataType } from "../util/buildUpdateDataType";
import { getNestedWriteFields } from "../util/getNestedWriteFields";
import { skipUnion } from "../util/skipUnion";

const getOneGassmaUpdateSingleData = (
  schemaName: string,
  sheetName: string,
  sheetContent: Record<string, unknown[]>,
  relations?: RelationsConfig,
  strict?: boolean,
  dictYaml?: Record<string, Record<string, unknown[]>>,
) => {
  const sk = skipUnion(strict);
  const nestedFields = getNestedWriteFields(
    schemaName,
    sheetName,
    relations,
    "update",
    strict,
    dictYaml,
  );
  const baseDataType = buildUpdateDataType(
    `Gassma${schemaName}${sheetName}Use`,
    sheetContent,
    strict,
  );
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
