import { skipOptionalWrap } from "../util/skipUnion";

const getOneGassmaCreateMany = (
  schemaName: string,
  sheetName: string,
  strict?: boolean,
) => {
  const elementType = skipOptionalWrap(
    `Gassma${schemaName}${sheetName}Use`,
    strict,
  );

  return `
export type Gassma${schemaName}${sheetName}CreateManyData = {
  data: ${elementType}[];
};
`;
};

export { getOneGassmaCreateMany };
