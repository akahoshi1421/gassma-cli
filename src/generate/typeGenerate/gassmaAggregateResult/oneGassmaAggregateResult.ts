const getOneGassmaAggregateResult = (sheetName: string) => {
  return `
declare type Gassma${sheetName}AggregateResult<T extends Gassma${sheetName}AggregateData> = {
  [K in keyof T as K extends "_avg" | "_count" | "_max" | "_min" | "_sum"
    ? T[K] extends undefined
      ? never
      : K
    : never]: K extends string ? Gassma${sheetName}AggregateField<T[K], K> : never;
};
`;
};

export { getOneGassmaAggregateResult };
