import type { RelationsConfig } from "../../read/extractRelations";
import { getNestedWriteFields } from "../util/getNestedWriteFields";

const getOneGassmaCreate = (sheetName: string, relations?: RelationsConfig) => {
  const nestedFields = getNestedWriteFields(sheetName, relations);
  const dataType = nestedFields
    ? `Gassma${sheetName}Use & {\n${nestedFields}  }`
    : `Gassma${sheetName}Use`;

  return `
declare type Gassma${sheetName}CreateData = {
  data: ${dataType};
};
`;
};

export { getOneGassmaCreate };
