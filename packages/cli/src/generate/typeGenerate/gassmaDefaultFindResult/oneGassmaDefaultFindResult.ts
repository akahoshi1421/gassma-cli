const getOneGassmaDefaultFindResult = (
  schemaName: string,
  sheetName: string,
) => {
  return `
export type Gassma${schemaName}${sheetName}DefaultFindResult = Gassma${schemaName}${sheetName}CreateReturn;
`;
};

export { getOneGassmaDefaultFindResult };
