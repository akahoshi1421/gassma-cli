import type { RelationsConfig } from "../../read/extractRelations";
import { buildCreateDataType } from "../util/buildCreateDataType";
import { getNestedWriteFields } from "../util/getNestedWriteFields";
import { skipUnion } from "../util/skipUnion";

const getOneGassmaUpsertSingleData = (
  schemaName: string,
  sheetName: string,
  relations?: RelationsConfig,
  strict?: boolean,
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
  );
  const baseUpdateType = `Partial<{ [K in keyof Gassma${schemaName}${sheetName}Use]: Gassma${schemaName}${sheetName}Use[K] | Gassma.NumberOperation${sk} }>`;
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
