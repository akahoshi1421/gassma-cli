import type { RelationsConfig } from "../../read/extractRelations";
import { buildCreateDataType } from "../util/buildCreateDataType";
import { buildUpdateDataType } from "../util/buildUpdateDataType";
import { getNestedWriteFields } from "../util/getNestedWriteFields";
import { skipUnion } from "../util/skipUnion";

const getOneGassmaUpsertSingleData = (
  schemaName: string,
  sheetName: string,
  sheetContent: Record<string, unknown[]>,
  relations?: RelationsConfig,
  strict?: boolean,
  dictYaml?: Record<string, Record<string, unknown[]>>,
) => {
  const sk = skipUnion(strict);
  const createType = buildCreateDataType(
    schemaName,
    sheetName,
    relations,
    strict,
  );

  const nestedFields = getNestedWriteFields(
    schemaName,
    sheetName,
    relations,
    "update",
    strict,
    dictYaml,
  );
  const baseUpdateType = buildUpdateDataType(
    `Gassma${schemaName}${sheetName}Use`,
    sheetContent,
    strict,
  );
  const updateType = nestedFields
    ? `${baseUpdateType} & {\n${nestedFields}  }`
    : baseUpdateType;

  const selectType = `Gassma${schemaName}${sheetName}Select`;
  const omitType = `Gassma${schemaName}${sheetName}Omit`;

  return `
export type Gassma${schemaName}${sheetName}UpsertSingleData = {
  where: Gassma${schemaName}${sheetName}WhereUse;
  create: ${createType};
  update: ${updateType};
  include?: Gassma${schemaName}${sheetName}Include${sk};
} & ({ select?: ${selectType}${sk}; omit?: never } | { select?: never; omit?: ${omitType}${sk} });
`;
};

export { getOneGassmaUpsertSingleData };
