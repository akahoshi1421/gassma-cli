const getOneGassmaUpsertData = (sheetName: string) => {
  return `
export type Gassma${sheetName}UpsertData = {
  where: Gassma${sheetName}WhereUse;
  update: Gassma${sheetName}Use;
  data: Gassma${sheetName}Use;
}
`;
};

export { getOneGassmaUpsertData };
