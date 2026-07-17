const getOneGassmaUpdateData = (schemaName: string, sheetName: string) => {
  const dataType = `Partial<{ [K in keyof Gassma${schemaName}${sheetName}Use]: Gassma${schemaName}${sheetName}Use[K] | Gassma.NumberOperation }>`;

  return `
export type Gassma${schemaName}${sheetName}UpdateData = {
  where?: Gassma${schemaName}${sheetName}WhereUse;
  data: ${dataType};
  limit?: number;
};
`;
};

export { getOneGassmaUpdateData };
