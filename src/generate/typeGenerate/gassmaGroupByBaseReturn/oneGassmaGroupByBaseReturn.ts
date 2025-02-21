const getOneGassmaGroupByBaseReturn = (sheetName: string) => {
  return `
export type Gassma${sheetName}GroupByBaseReturn = Gassma${sheetName}CreateReturn;
`;
};

export { getOneGassmaGroupByBaseReturn };
