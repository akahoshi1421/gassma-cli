const getOneGassmaCreateMany = (schemaName: string, sheetName: string) => {
  return `
export type Gassma${schemaName}${sheetName}CreateManyData = {
  data: Gassma${schemaName}${sheetName}Use[];
};
`;
};

export { getOneGassmaCreateMany };
