const getGassmaCommonTypes = () => {
  return `  type RelationsConfig = Record<string, Record<string, unknown>>;

  type NumberOperation = {
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
  };

  type SortOrderInput = {
    sort: "asc" | "desc";
    nulls?: "first" | "last";
  };

  type TrueKeys<T> = { [K in keyof T]: T[K] extends true ? K : never }[keyof T];
  type FalseKeys<T> = { [K in keyof T]: T[K] extends false ? K : never }[keyof T];
  type ResolveOmitKeys<GO, QO> = Exclude<TrueKeys<GO>, FalseKeys<QO>> | TrueKeys<QO>;

  type SelectOf<X> = X extends { select: infer S } ? S : undefined;
  type IncludeOf<X> = X extends { include: infer I } ? I : undefined;
  type OmitOf<X> = X extends { omit: infer O } ? O : undefined;
  type CountResult<X> = X extends { select: infer S }
    ? { [P in keyof S]: number }
    : { [key: string]: number };

  type ManyReturn = {
    count: number;
  };

  type CreateManyReturn = ManyReturn;
  type UpdateManyReturn = ManyReturn;
  type DeleteManyReturn = ManyReturn;
`;
};

export { getGassmaCommonTypes };
