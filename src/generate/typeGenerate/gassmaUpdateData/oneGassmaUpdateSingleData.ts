import type { RelationsConfig } from "../../read/extractRelations";
import { getNestedWriteFields } from "../util/getNestedWriteFields";

const getOneGassmaUpdateSingleData = (
  schemaName: string,
  sheetName: string,
  relations?: RelationsConfig,
) => {
  const nestedFields = getNestedWriteFields(schemaName, sheetName, relations);
  const baseDataType = `Partial<{ [K in keyof Gassma${schemaName}${sheetName}Use]: Gassma${schemaName}${sheetName}Use[K] | Gassma.NumberOperation }>`;
  const dataType = nestedFields
    ? `${baseDataType} & {\n${nestedFields}  }`
    : baseDataType;

  return `
declare type Gassma${schemaName}${sheetName}UpdateSingleData = {
  where: Gassma${schemaName}${sheetName}WhereUse;
  data: ${dataType};
  select?: Gassma${schemaName}${sheetName}Select;
  omit?: Gassma${schemaName}${sheetName}Omit;
};
`;
};

export { getOneGassmaUpdateSingleData };
