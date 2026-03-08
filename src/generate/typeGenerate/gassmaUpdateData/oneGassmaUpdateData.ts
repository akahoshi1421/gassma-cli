import type { RelationsConfig } from "../../read/extractRelations";
import { getNestedWriteFields } from "../util/getNestedWriteFields";

const getOneGassmaUpdateData = (
  schemaName: string,
  sheetName: string,
  relations?: RelationsConfig,
) => {
  const nestedFields = getNestedWriteFields(sheetName, relations);
  const baseDataType = `{ [K in keyof Gassma${schemaName}${sheetName}Use]: Gassma${schemaName}${sheetName}Use[K] | Gassma.NumberOperation }`;
  const dataType = nestedFields
    ? `${baseDataType} & {\n${nestedFields}  }`
    : baseDataType;

  return `
declare type Gassma${schemaName}${sheetName}UpdateData = {
  where?: Gassma${schemaName}${sheetName}WhereUse;
  data: ${dataType};
  limit?: number;
};
`;
};

export { getOneGassmaUpdateData };
