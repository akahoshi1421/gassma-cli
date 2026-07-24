const getOneGassmaGroupByKeyOfBaseReturn = (
  schemaName: string,
  sheetName: string,
) => {
  return `
export type Gassma${schemaName}${sheetName}GroupByKeyOfBaseReturn = keyof Gassma${schemaName}${sheetName}GroupByBaseReturn;
`;
};

export { getOneGassmaGroupByKeyOfBaseReturn };
