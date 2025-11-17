const getOneGassmaDeleteData = (sheetName: string) => {
  return `
declare type Gassma${sheetName}DeleteData = {
  where: Gassma${sheetName}WhereUse;
};
`;
};

export { getOneGassmaDeleteData };
