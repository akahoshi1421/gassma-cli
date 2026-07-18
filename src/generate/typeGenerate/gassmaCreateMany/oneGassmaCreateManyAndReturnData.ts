import { skipOptionalWrap, skipUnion } from "../util/skipUnion";

const getOneGassmaCreateManyAndReturnData = (
  schemaName: string,
  sheetName: string,
  strict?: boolean,
) => {
  const sk = skipUnion(strict);
  const elementType = skipOptionalWrap(
    `Gassma${schemaName}${sheetName}Use`,
    strict,
  );
  const selectType = `Gassma${schemaName}${sheetName}Select`;
  const omitType = `Gassma${schemaName}${sheetName}Omit`;

  return `
export type Gassma${schemaName}${sheetName}CreateManyAndReturnData = {
  data: ${elementType}[];
  include?: Gassma${schemaName}${sheetName}Include${sk};
} & ({ select?: ${selectType}${sk}; omit?: never } | { select?: never; omit?: ${omitType}${sk} });
`;
};

export { getOneGassmaCreateManyAndReturnData };
