const getOneGassmaAggregateField = (schemaName: string, sheetName: string) => {
  return `
export type Gassma${schemaName}${sheetName}AggregateField<T, K extends string> = T extends undefined
  ? never
  : K extends "_count"
    ? { [P in keyof T as T[P] extends true ? P : never]: number }
    : {
        [P in keyof T as T[P] extends true
          ? P & keyof Gassma${schemaName}${sheetName}AggregateBaseReturn
          : never]: Gassma${schemaName}${sheetName}AggregateBaseReturn[P & keyof Gassma${schemaName}${sheetName}AggregateBaseReturn];
      };
`;
};

export { getOneGassmaAggregateField };
