const getOneGassmaUpdateData = (sheetName: string) => {
  return `
declare type Gassma${sheetName}UpdateData = {
  where?: Gassma${sheetName}WhereUse;
  data: Gassma${sheetName}Use;
};
`;
};

export { getOneGassmaUpdateData };
