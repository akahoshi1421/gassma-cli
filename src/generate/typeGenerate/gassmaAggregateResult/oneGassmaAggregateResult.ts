const getOneGassmaAggregateResult = (schemaName: string, sheetName: string) => {
  return `
export type Gassma${schemaName}${sheetName}AggregateResult<T extends Gassma${schemaName}${sheetName}AggregateData> = {
  [K in keyof T as K extends "_avg" | "_count" | "_max" | "_min" | "_sum"
    ? T[K] extends undefined
      ? never
      : K
    : never]: K extends string ? Gassma${schemaName}${sheetName}AggregateField<T[K], K> : never;
};
`;
};

export { getOneGassmaAggregateResult };
