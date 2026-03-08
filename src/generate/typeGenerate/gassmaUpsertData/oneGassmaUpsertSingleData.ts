import type { RelationsConfig } from "../../read/extractRelations";
import { getNestedWriteFields } from "../util/getNestedWriteFields";

const getOneGassmaUpsertSingleData = (
  sheetName: string,
  relations?: RelationsConfig,
) => {
  const nestedFields = getNestedWriteFields(sheetName, relations);

  const createType = nestedFields
    ? `Gassma${sheetName}Use & {\n${nestedFields}  }`
    : `Gassma${sheetName}Use`;

  const baseUpdateType = `{ [K in keyof Gassma${sheetName}Use]: Gassma${sheetName}Use[K] | Gassma.NumberOperation }`;
  const updateType = nestedFields
    ? `${baseUpdateType} & {\n${nestedFields}  }`
    : baseUpdateType;

  return `
declare type Gassma${sheetName}UpsertSingleData = {
  where: Gassma${sheetName}WhereUse;
  create: ${createType};
  update: ${updateType};
  select?: Gassma${sheetName}Select;
  include?: Gassma.IncludeData;
  omit?: Gassma${sheetName}Omit;
};
`;
};

export { getOneGassmaUpsertSingleData };
