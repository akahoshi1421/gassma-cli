const getOneGassmaByField = (schemaName: string, sheetName: string) => {
  return `
declare type Gassma${schemaName}${sheetName}ByField<T extends Gassma${schemaName}${sheetName}GroupByKeyOfBaseReturn | Gassma${schemaName}${sheetName}GroupByKeyOfBaseReturn[]> =
  T extends Gassma${schemaName}${sheetName}GroupByKeyOfBaseReturn[]
    ? {
        [K in T[number]]: Gassma${schemaName}${sheetName}GroupByBaseReturn[K & keyof Gassma${schemaName}${sheetName}GroupByBaseReturn];
      }
    : T extends keyof Gassma${schemaName}${sheetName}GroupByBaseReturn
      ? { [K in T]: Gassma${schemaName}${sheetName}GroupByBaseReturn[K] }
      : never;
`;
};

export { getOneGassmaByField };
