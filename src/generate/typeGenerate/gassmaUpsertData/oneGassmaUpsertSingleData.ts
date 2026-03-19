import type { RelationsConfig } from "../../read/extractRelations";
import { getNestedWriteFields } from "../util/getNestedWriteFields";

const getOneGassmaUpsertSingleData = (
  schemaName: string,
  sheetName: string,
  relations?: RelationsConfig,
) => {
  const nestedFields = getNestedWriteFields(schemaName, sheetName, relations);

  const createType = nestedFields
    ? `Gassma${schemaName}${sheetName}Use & {\n${nestedFields}  }`
    : `Gassma${schemaName}${sheetName}Use`;

  const baseUpdateType = `Partial<{ [K in keyof Gassma${schemaName}${sheetName}Use]: Gassma${schemaName}${sheetName}Use[K] | Gassma.NumberOperation }>`;
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
  include?: Gassma${schemaName}${sheetName}Include;
} & ({ select?: ${selectType}; omit?: never } | { select?: never; omit?: ${omitType} });
`;
};

export { getOneGassmaUpsertSingleData };
