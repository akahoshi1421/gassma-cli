const getOneGassmaGroupByResult = (schemaName: string, sheetName: string) => {
  return `
declare type Gassma${schemaName}${sheetName}GroupByResult<T extends Gassma${schemaName}${sheetName}GroupByData> = Gassma${schemaName}${sheetName}ByField<T["by"]> & {
  [K in keyof T as K extends "_avg" | "_count" | "_max" | "_min" | "_sum"
    ? T[K] extends undefined
      ? never
      : K
    : never]: K extends string ? Gassma${schemaName}${sheetName}AggregateField<T[K], K> : never;
};
`;
};

export { getOneGassmaGroupByResult };
