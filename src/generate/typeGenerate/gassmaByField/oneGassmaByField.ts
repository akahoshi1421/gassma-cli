const getOneGassmaByField = (sheetName: string) => {
  return `
declare type Gassma${sheetName}ByField<T extends Gassma${sheetName}GroupByKeyOfBaseReturn | Gassma${sheetName}GroupByKeyOfBaseReturn[]> =
  T extends Gassma${sheetName}GroupByKeyOfBaseReturn[]
    ? {
        [K in T[number]]: Gassma${sheetName}GroupByBaseReturn[K & keyof Gassma${sheetName}GroupByBaseReturn];
      }
    : T extends keyof Gassma${sheetName}GroupByBaseReturn
      ? { [K in T]: Gassma${sheetName}GroupByBaseReturn[K] }
      : never;
`;
};

export { getOneGassmaByField };
