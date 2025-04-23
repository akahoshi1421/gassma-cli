const getOneGassmaGroupByResult = (sheetName: string) => {
  return `
declare type Gassma${sheetName}GroupByResult<T extends Gassma${sheetName}GroupByData> = Gassma${sheetName}ByField<T["by"]> & {
  [K in keyof T as K extends "_avg" | "_count" | "_max" | "_min" | "_sum"
    ? T[K] extends undefined
      ? never
      : K
    : never]: K extends string ? Gassma${sheetName}AggregateField<T[K], K> : never;
};
`;
};

export { getOneGassmaGroupByResult };
