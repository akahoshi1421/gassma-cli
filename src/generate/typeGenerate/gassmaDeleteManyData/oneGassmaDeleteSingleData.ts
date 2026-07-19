import { skipUnion } from "../util/skipUnion";

const getOneGassmaDeleteSingleData = (
  schemaName: string,
  sheetName: string,
  strict?: boolean,
) => {
  const sk = skipUnion(strict);
  const selectType = `Gassma${schemaName}${sheetName}Select`;
  const omitType = `Gassma${schemaName}${sheetName}Omit`;

  return `
export type Gassma${schemaName}${sheetName}DeleteSingleData = {
  where: Gassma${schemaName}${sheetName}WhereUse;
  include?: Gassma${schemaName}${sheetName}Include${sk};
} & ({ select?: ${selectType}${sk}; omit?: never } | { select?: never; omit?: ${omitType}${sk} });
`;
};

export { getOneGassmaDeleteSingleData };
