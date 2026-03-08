const getOneGassmaGroupByBaseReturn = (
  schemaName: string,
  sheetName: string,
) => {
  return `
declare type Gassma${schemaName}${sheetName}GroupByBaseReturn = Gassma${schemaName}${sheetName}CreateReturn;
`;
};

export { getOneGassmaGroupByBaseReturn };
