const getOneGassmaFindResult = (schemaName: string, sheetName: string) => {
  return `
export type Gassma${schemaName}${sheetName}FindResult<S, QO = undefined, GO = {}> = S extends Gassma${schemaName}${sheetName}Select
  ? {
      [K in keyof S as S[K] extends true
        ? K & keyof Gassma${schemaName}${sheetName}DefaultFindResult
        : never]: Gassma${schemaName}${sheetName}DefaultFindResult[K & keyof Gassma${schemaName}${sheetName}DefaultFindResult];
    }
  : {
      [K in keyof Gassma${schemaName}${sheetName}DefaultFindResult as
        K extends Gassma.ResolveOmitKeys<GO, QO> ? never : K
      ]: Gassma${schemaName}${sheetName}DefaultFindResult[K];
    };
`;
};

export { getOneGassmaFindResult };
