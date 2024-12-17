const getOneGassmaDeleteData = (sheetName: string) => {
  return `
export type Gassma${sheetName}DeleteData = {
  where: Gassma${sheetName}WhereUse;
}
`;
};

export { getOneGassmaDeleteData };
