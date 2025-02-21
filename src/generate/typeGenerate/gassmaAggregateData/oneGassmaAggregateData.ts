const getOneGassmaAggregateData = (sheetName: string) => {
  return `
export type Gassma${sheetName}AggregateData = {
  where?: Gassma${sheetName}WhereUse;
  orderBy?: Gassma${sheetName}OrderBy;
  take?: number;
  skip?: number;
  _avg?: Gassma${sheetName}Select;
  _count?: Gassma${sheetName}Select;
  _max?: Gassma${sheetName}Select;
  _min?: Gassma${sheetName}Select;
  _sum?: Gassma${sheetName}Select;
};
`;
};

export { getOneGassmaAggregateData };
