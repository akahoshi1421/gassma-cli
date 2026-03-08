const getOneGassmaGroupByKeyOfBaseReturn = (
  schemaName: string,
  sheetName: string,
) => {
  return `
declare type Gassma${schemaName}${sheetName}GroupByKeyOfBaseReturn = keyof Gassma${schemaName}${sheetName}GroupByBaseReturn;
`;
};

export { getOneGassmaGroupByKeyOfBaseReturn };
