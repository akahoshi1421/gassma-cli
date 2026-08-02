const getOneGassmaCountResult = (schemaName: string, sheetName: string) => {
  const self = `Gassma${schemaName}${sheetName}`;

  return `
export type ${self}CountResult<T extends ${self}CountData> = T extends { select: infer S }
  ? S extends true
    ? number
    : { [K in keyof S]: number }
  : number;
`;
};

export { getOneGassmaCountResult };
