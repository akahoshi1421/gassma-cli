const getOneGassmaCreateMany = (sheetName: string) => {
  return `
declare type Gassma${sheetName}CreateManyData = {
  data: Gassma${sheetName}Use[];
};
`;
};

export { getOneGassmaCreateMany };
