const getOneGassmaDeleteSingleData = (
  schemaName: string,
  sheetName: string,
) => {
  return `
declare type Gassma${schemaName}${sheetName}DeleteSingleData = {
  where: Gassma${schemaName}${sheetName}WhereUse;
  select?: Gassma${schemaName}${sheetName}Select;
  include?: Gassma.IncludeData;
  omit?: Gassma${schemaName}${sheetName}Omit;
};
`;
};

export { getOneGassmaDeleteSingleData };
