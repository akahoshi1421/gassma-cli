const getOneGassmaCreateManyAndReturnData = (
  schemaName: string,
  sheetName: string,
) => {
  const selectType = `Gassma${schemaName}${sheetName}Select`;
  const omitType = `Gassma${schemaName}${sheetName}Omit`;

  return `
export type Gassma${schemaName}${sheetName}CreateManyAndReturnData = {
  data: Gassma${schemaName}${sheetName}Use[];
  include?: Gassma${schemaName}${sheetName}Include;
} & ({ select?: ${selectType}; omit?: never } | { select?: never; omit?: ${omitType} });
`;
};

export { getOneGassmaCreateManyAndReturnData };
