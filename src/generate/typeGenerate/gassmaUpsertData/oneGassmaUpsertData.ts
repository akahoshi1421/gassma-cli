const getOneGassmaUpsertData = (schemaName: string, sheetName: string) => {
  return `
declare type Gassma${schemaName}${sheetName}UpsertData = {
  where: Gassma${schemaName}${sheetName}WhereUse;
  update: Gassma${schemaName}${sheetName}Use;
  data: Gassma${schemaName}${sheetName}Use;
};
`;
};

export { getOneGassmaUpsertData };
