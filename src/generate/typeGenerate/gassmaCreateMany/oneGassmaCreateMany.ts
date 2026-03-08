const getOneGassmaCreateMany = (schemaName: string, sheetName: string) => {
  return `
declare type Gassma${schemaName}${sheetName}CreateManyData = {
  data: Gassma${schemaName}${sheetName}Use[];
};
`;
};

export { getOneGassmaCreateMany };
