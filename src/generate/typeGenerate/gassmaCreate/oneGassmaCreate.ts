const getOneGassmaCreate = (sheetName: string) => {
  return `
declare type Gassma${sheetName}CreateData = {
  data: Gassma${sheetName}Use;
};
`;
};

export { getOneGassmaCreate };
