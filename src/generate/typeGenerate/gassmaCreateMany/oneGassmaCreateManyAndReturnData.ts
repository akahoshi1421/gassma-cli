const getOneGassmaCreateManyAndReturnData = (
  schemaName: string,
  sheetName: string,
) => {
  const s = `Gassma${schemaName}${sheetName}Select`;
  const o = `Gassma${schemaName}${sheetName}Omit`;

  return `
export type Gassma${schemaName}${sheetName}CreateManyAndReturnData = {
  data: Gassma${schemaName}${sheetName}Use[];
  include?: Gassma${schemaName}${sheetName}Include;
} & ({ select?: ${s}; omit?: never } | { select?: never; omit?: ${o} });
`;
};

export { getOneGassmaCreateManyAndReturnData };
