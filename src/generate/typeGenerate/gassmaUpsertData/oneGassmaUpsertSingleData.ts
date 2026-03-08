import type { RelationsConfig } from "../../read/extractRelations";
import { getNestedWriteFields } from "../util/getNestedWriteFields";

const getOneGassmaUpsertSingleData = (
  schemaName: string,
  sheetName: string,
  relations?: RelationsConfig,
) => {
  const nestedFields = getNestedWriteFields(sheetName, relations);

  const createType = nestedFields
    ? `Gassma${schemaName}${sheetName}Use & {\n${nestedFields}  }`
    : `Gassma${schemaName}${sheetName}Use`;

  const baseUpdateType = `Partial<{ [K in keyof Gassma${schemaName}${sheetName}Use]: Gassma${schemaName}${sheetName}Use[K] | Gassma.NumberOperation }>`;
  const updateType = nestedFields
    ? `${baseUpdateType} & {\n${nestedFields}  }`
    : baseUpdateType;

  return `
declare type Gassma${schemaName}${sheetName}UpsertSingleData = {
  where: Gassma${schemaName}${sheetName}WhereUse;
  create: ${createType};
  update: ${updateType};
  select?: Gassma${schemaName}${sheetName}Select;
  include?: Gassma.IncludeData;
  omit?: Gassma${schemaName}${sheetName}Omit;
};
`;
};

export { getOneGassmaUpsertSingleData };
