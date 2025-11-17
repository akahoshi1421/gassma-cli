const getOneGassmaDefaultFindResult = (sheetName: string) => {
  return `
declare type Gassma${sheetName}DefaultFindResult = Gassma${sheetName}CreateReturn;
`;
};

export { getOneGassmaDefaultFindResult };
