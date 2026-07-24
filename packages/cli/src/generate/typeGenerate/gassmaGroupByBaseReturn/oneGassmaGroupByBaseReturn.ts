const getOneGassmaGroupByBaseReturn = (
  schemaName: string,
  sheetName: string,
) => {
  return `
export type Gassma${schemaName}${sheetName}GroupByBaseReturn = Gassma${schemaName}${sheetName}CreateReturn;
`;
};

export { getOneGassmaGroupByBaseReturn };
