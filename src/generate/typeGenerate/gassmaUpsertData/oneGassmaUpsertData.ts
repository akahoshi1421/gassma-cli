const getOneGassmaUpsertData = (schemaName: string, sheetName: string) => {
  return `
declare type Gassma${schemaName}${sheetName}UpsertData = {
  where: Gassma${schemaName}${sheetName}WhereUse;
  update: Partial<{ [K in keyof Gassma${schemaName}${sheetName}Use]: Gassma${schemaName}${sheetName}Use[K] | Gassma.NumberOperation }>;
  data: Gassma${schemaName}${sheetName}Use;
};
`;
};

export { getOneGassmaUpsertData };
