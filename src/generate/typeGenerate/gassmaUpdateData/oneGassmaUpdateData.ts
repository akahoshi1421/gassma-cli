const getOneGassmaUpdateData = (sheetName: string) => {
  return `
export type Gassma${sheetName}UpdateManyData = {
  where?: Gassma${sheetName}WhereUse;
  data: Gassma${sheetName}Use;
}
`;
};

export { getOneGassmaUpdateData };
