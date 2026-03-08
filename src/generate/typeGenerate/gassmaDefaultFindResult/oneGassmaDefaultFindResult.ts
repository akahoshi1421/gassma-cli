const getOneGassmaDefaultFindResult = (
  schemaName: string,
  sheetName: string,
) => {
  return `
declare type Gassma${schemaName}${sheetName}DefaultFindResult = Gassma${schemaName}${sheetName}CreateReturn;
`;
};

export { getOneGassmaDefaultFindResult };
