const getOneGassmaAggregateData = (schemaName: string, sheetName: string) => {
  return `
export type Gassma${schemaName}${sheetName}AggregateData = {
  where?: Gassma${schemaName}${sheetName}WhereUse;
  orderBy?: Gassma${schemaName}${sheetName}OrderBy;
  take?: number;
  skip?: number;
  _avg?: Gassma${schemaName}${sheetName}Select;
  _count?: Gassma${schemaName}${sheetName}Select;
  _max?: Gassma${schemaName}${sheetName}Select;
  _min?: Gassma${schemaName}${sheetName}Select;
  _sum?: Gassma${schemaName}${sheetName}Select;
};
`;
};

export { getOneGassmaAggregateData };
