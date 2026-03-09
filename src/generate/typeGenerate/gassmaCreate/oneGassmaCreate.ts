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

  const s = `Gassma${schemaName}${sheetName}Select`;
  const o = `Gassma${schemaName}${sheetName}Omit`;

  return `
declare type Gassma${schemaName}${sheetName}CreateData = {
  data: ${dataType};
} & ({ select?: ${s}; omit?: never } | { select?: never; omit?: ${o} });
`;
};

export { getOneGassmaCreate };
