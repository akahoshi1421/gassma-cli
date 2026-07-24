const getOneGassmaFindManyData = (schemaName: string, sheetName: string) => {
  return `
export type Gassma${schemaName}${sheetName}FindManyData = Gassma${schemaName}${sheetName}FindData;
`;
};

export { getOneGassmaFindManyData };
