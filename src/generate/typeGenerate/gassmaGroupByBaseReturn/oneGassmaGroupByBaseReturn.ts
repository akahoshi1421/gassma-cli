const getOneGassmaGroupByBaseReturn = (sheetName: string) => {
  return `
declare type Gassma${sheetName}GroupByBaseReturn = Gassma${sheetName}CreateReturn;
`;
};

export { getOneGassmaGroupByBaseReturn };
