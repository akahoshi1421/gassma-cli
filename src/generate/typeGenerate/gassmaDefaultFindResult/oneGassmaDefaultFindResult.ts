const getOneGassmaDefaultFindResult = (sheetName: string) => {
  return `
export type Gassma${sheetName}DefaultFindResult = Gassma${sheetName}CreateReturn;
`;
};

export { getOneGassmaDefaultFindResult };
