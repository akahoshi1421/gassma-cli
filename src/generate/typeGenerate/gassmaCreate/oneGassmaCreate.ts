import type { RelationsConfig } from "../../read/extractRelations";
import { buildCreateDataType } from "../util/buildCreateDataType";

const getOneGassmaCreate = (
  schemaName: string,
  sheetName: string,
  relations?: RelationsConfig,
) => {
  const dataType = buildCreateDataType(schemaName, sheetName, relations);

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
