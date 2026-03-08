const getOneGassmaDeleteData = (schemaName: string, sheetName: string) => {
  return `
declare type Gassma${schemaName}${sheetName}DeleteData = {
  where: Gassma${schemaName}${sheetName}WhereUse;
  limit?: number;
};
`;
};

export { getOneGassmaDeleteData };
