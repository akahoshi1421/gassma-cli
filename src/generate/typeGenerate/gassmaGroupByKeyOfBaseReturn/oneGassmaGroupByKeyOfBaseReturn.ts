const getOneGassmaGroupByKeyOfBaseReturn = (sheetName: string) => {
  return `
export type Gassma${sheetName}KeyOfBaseReturn = keyof Gassma${sheetName}GroupByBaseReturn;
`;
};

export { getOneGassmaGroupByKeyOfBaseReturn };
