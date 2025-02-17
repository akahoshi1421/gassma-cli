const getOneGassmaFindManyData = (sheetName: string) => {
  return `
export type Gassma${sheetName}FindManyData = Gassma${sheetName}FindData;    
`;
};

export { getOneGassmaFindManyData };
