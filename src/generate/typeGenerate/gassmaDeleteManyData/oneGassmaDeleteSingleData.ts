const getOneGassmaDeleteSingleData = (sheetName: string) => {
  return `
declare type Gassma${sheetName}DeleteSingleData = {
  where: Gassma${sheetName}WhereUse;
  select?: Gassma${sheetName}Select;
  include?: Gassma.IncludeData;
  omit?: Gassma${sheetName}Omit;
};
`;
};

export { getOneGassmaDeleteSingleData };
