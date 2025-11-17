const getOneGassmaFindManyData = (sheetName: string) => {
  return `
declare type Gassma${sheetName}FindManyData = Gassma${sheetName}FindData;    
`;
};

export { getOneGassmaFindManyData };
