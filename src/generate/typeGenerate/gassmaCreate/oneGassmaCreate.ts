const getOneGassmaCreate = (sheetName: string) => {
  return `
export type Gassma${sheetName}CreateData = {
  data: Gassma${sheetName}Use;
};
`;
};

export { getOneGassmaCreate };
