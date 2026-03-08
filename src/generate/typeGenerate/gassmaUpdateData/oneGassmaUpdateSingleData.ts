import type { RelationsConfig } from "../../read/extractRelations";
import { getNestedWriteFields } from "../util/getNestedWriteFields";

const getOneGassmaUpdateSingleData = (
  sheetName: string,
  relations?: RelationsConfig,
) => {
  const nestedFields = getNestedWriteFields(sheetName, relations);
  const baseDataType = `{ [K in keyof Gassma${sheetName}Use]: Gassma${sheetName}Use[K] | Gassma.NumberOperation }`;
  const dataType = nestedFields
    ? `${baseDataType} & {\n${nestedFields}  }`
    : baseDataType;

  return `
declare type Gassma${sheetName}UpdateSingleData = {
  where: Gassma${sheetName}WhereUse;
  data: ${dataType};
  select?: Gassma${sheetName}Select;
  omit?: Gassma${sheetName}Omit;
};
`;
};

export { getOneGassmaUpdateSingleData };
