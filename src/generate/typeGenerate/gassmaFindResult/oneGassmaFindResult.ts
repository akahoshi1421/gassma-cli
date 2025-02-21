const getOneGassmaFindResult = (sheetName: string) => {
  return `
export type Gassma${sheetName}FindResult<T> = T extends undefined
  ? Gassma${sheetName}DefaultFindResult
  : T extends Gassma${sheetName}Select
    ? {
        [K in keyof T as T[K] extends true
          ? K & keyof Gassma${sheetName}DefaultFindResult
          : never]: Gassma${sheetName}DefaultFindResult[K & keyof Gassma${sheetName}DefaultFindResult];
      }
    : Gassma${sheetName}DefaultFindResult;
`;
};

export { getOneGassmaFindResult };
