const getOneGassmaCountData = (schemaName: string, sheetName: string) => {
  return `
export type Gassma${schemaName}${sheetName}CountData = {
  where?: Gassma${schemaName}${sheetName}WhereUse;
  orderBy?: Gassma${schemaName}${sheetName}OrderBy;
  take?: number;
  skip?: number;
  cursor?: Partial<Gassma${schemaName}${sheetName}Use>;
};
`;
};

export { getOneGassmaCountData };
