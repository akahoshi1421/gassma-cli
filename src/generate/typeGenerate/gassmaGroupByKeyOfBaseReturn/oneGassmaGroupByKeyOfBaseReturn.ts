const getOneGassmaGroupByKeyOfBaseReturn = (sheetName: string) => {
  return `
declare type Gassma${sheetName}GroupByKeyOfBaseReturn = keyof Gassma${sheetName}GroupByBaseReturn;
`;
};

export { getOneGassmaGroupByKeyOfBaseReturn };
