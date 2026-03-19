const getOneGassmaFindFirstData = (schemaName: string, sheetName: string) => {
  const selectType = `Gassma${schemaName}${sheetName}Select`;
  const omitType = `Gassma${schemaName}${sheetName}Omit`;

  return `\nexport type Gassma${schemaName}${sheetName}FindFirstData = {
  where?: Gassma${schemaName}${sheetName}WhereUse;
  orderBy?: Gassma${schemaName}${sheetName}OrderBy;
  include?: Gassma${schemaName}${sheetName}Include;
  cursor?: Partial<Gassma${schemaName}${sheetName}Use>;
  _count?: Gassma${schemaName}${sheetName}CountValue;
} & ({ select?: ${selectType}; omit?: never } | { select?: never; omit?: ${omitType} });\n`;
};

export { getOneGassmaFindFirstData };
