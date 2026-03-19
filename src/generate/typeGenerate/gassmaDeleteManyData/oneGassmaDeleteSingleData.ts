const getOneGassmaDeleteSingleData = (
  schemaName: string,
  sheetName: string,
) => {
  const selectType = `Gassma${schemaName}${sheetName}Select`;
  const omitType = `Gassma${schemaName}${sheetName}Omit`;

  return `
export type Gassma${schemaName}${sheetName}DeleteSingleData = {
  where: Gassma${schemaName}${sheetName}WhereUse;
  include?: Gassma${schemaName}${sheetName}Include;
} & ({ select?: ${selectType}; omit?: never } | { select?: never; omit?: ${omitType} });
`;
};

export { getOneGassmaDeleteSingleData };
