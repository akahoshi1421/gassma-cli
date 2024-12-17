const getOneGassmaCountData = (sheetName: string) => {
  return `
export type Gassma${sheetName}CountData = {
  where?: Gassma${sheetName}WhereUse;
  orderBy?: Gassma${sheetName}OrderBy;
  take?: number;
  skip?: number;
}
`;
};

export { getOneGassmaCountData };
