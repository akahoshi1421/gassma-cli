const getOneGassmaUpdateData = (sheetName: string) => {
  return `
export type Gassma${sheetName}UpdateData = {
  where?: Gassma${sheetName}WhereUse;
  data: Gassma${sheetName}Use;
}
`;
};

export { getOneGassmaUpdateData };
