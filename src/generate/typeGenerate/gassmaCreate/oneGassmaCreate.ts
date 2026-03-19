import type { RelationsConfig } from "../../read/extractRelations";
import { getNestedWriteFields } from "../util/getNestedWriteFields";

const getOneGassmaCreate = (
  schemaName: string,
  sheetName: string,
  relations?: RelationsConfig,
) => {
  const nestedFields = getNestedWriteFields(schemaName, sheetName, relations);
  const dataType = nestedFields
    ? `Gassma${schemaName}${sheetName}Use & {\n${nestedFields}  }`
    : `Gassma${schemaName}${sheetName}Use`;

  const selectType = `Gassma${schemaName}${sheetName}Select`;
  const omitType = `Gassma${schemaName}${sheetName}Omit`;

  return `
export type Gassma${schemaName}${sheetName}CreateData = {
  data: ${dataType};
  include?: Gassma${schemaName}${sheetName}Include;
} & ({ select?: ${selectType}; omit?: never } | { select?: never; omit?: ${omitType} });
`;
};

export { getOneGassmaCreate };
