import type { RelationsConfig } from "../../read/extractRelations";
import { getNestedWriteFields } from "../util/getNestedWriteFields";

const getOneGassmaCreate = (
  schemaName: string,
  sheetName: string,
  relations?: RelationsConfig,
) => {
  const nestedFields = getNestedWriteFields(sheetName, relations);
  const dataType = nestedFields
    ? `Gassma${schemaName}${sheetName}Use & {\n${nestedFields}  }`
    : `Gassma${schemaName}${sheetName}Use`;

  return `
declare type Gassma${schemaName}${sheetName}CreateData = {
  data: ${dataType};
  select?: Gassma${schemaName}${sheetName}Select;
  omit?: Gassma${schemaName}${sheetName}Omit;
};
`;
};

export { getOneGassmaCreate };
