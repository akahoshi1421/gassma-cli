const getOneGassmaDeleteSingleData = (
  schemaName: string,
  sheetName: string,
) => {
  const s = `Gassma${schemaName}${sheetName}Select`;
  const o = `Gassma${schemaName}${sheetName}Omit`;

  return `
declare type Gassma${schemaName}${sheetName}DeleteSingleData = {
  where: Gassma${schemaName}${sheetName}WhereUse;
  include?: Gassma${schemaName}${sheetName}Include;
} & ({ select?: ${s}; omit?: never } | { select?: never; omit?: ${o} });
`;
};

export { getOneGassmaDeleteSingleData };
