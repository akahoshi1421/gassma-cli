const getOneGassmaCreateMany = (sheetName: string) => {
  return `
export type Gassma${sheetName}CreateManyData = {
  data: Gassma${sheetName}Use[];
};
`;
};

export { getOneGassmaCreateMany };
