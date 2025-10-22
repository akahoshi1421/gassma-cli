const getOneGassmaGroupByKeyOfBaseReturn = (sheetName: string) => {
  return `
export type Gassma${sheetName}GroupByKeyOfBaseReturn = keyof Gassma${sheetName}GroupByBaseReturn;
`;
};

export { getOneGassmaGroupByKeyOfBaseReturn };
