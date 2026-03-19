const getOneGassmaDeleteData = (schemaName: string, sheetName: string) => {
  return `
export type Gassma${schemaName}${sheetName}DeleteData = {
  where: Gassma${schemaName}${sheetName}WhereUse;
  limit?: number;
};
`;
};

export { getOneGassmaDeleteData };
