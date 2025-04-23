const getOneGassmaAggregateField = (sheetName: string) => {
  return `
declare type Gassma${sheetName}AggregateField<T, K extends string> = T extends undefined
  ? never
  : K extends "_count"
    ? { [P in keyof T as T[P] extends true ? P : never]: number }
    : {
        [P in keyof T as T[P] extends true
          ? P & keyof Gassma${sheetName}AggregateBaseReturn
          : never]: Gassma${sheetName}AggregateBaseReturn[P & keyof Gassma${sheetName}AggregateBaseReturn];
      };
`;
};

export { getOneGassmaAggregateField };
