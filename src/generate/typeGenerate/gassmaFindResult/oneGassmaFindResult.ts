const getOneGassmaFindResult = (schemaName: string, sheetName: string) => {
  return `
declare type Gassma${schemaName}${sheetName}FindResult<T> = T extends undefined
  ? Gassma${schemaName}${sheetName}DefaultFindResult
  : T extends Gassma${schemaName}${sheetName}Select
    ? {
        [K in keyof T as T[K] extends true
          ? K & keyof Gassma${schemaName}${sheetName}DefaultFindResult
          : never]: Gassma${schemaName}${sheetName}DefaultFindResult[K & keyof Gassma${schemaName}${sheetName}DefaultFindResult];
      }
    : Gassma${schemaName}${sheetName}DefaultFindResult;
`;
};

export { getOneGassmaFindResult };
