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

  type FilterConditions<T> = {
    equals?: T | FieldRef;
    not?: T;
    in?: T[];
    notIn?: T[];
    lt?: T | FieldRef;
    lte?: T | FieldRef;
    gt?: T | FieldRef;
    gte?: T | FieldRef;
    contains?: string | FieldRef;
    startsWith?: string | FieldRef;
    endsWith?: string | FieldRef;
    mode?: "default" | "insensitive";
  };

  type TrueKeys<T> = { [K in keyof T]: T[K] extends true ? K : never }[keyof T];
  type FalseKeys<T> = { [K in keyof T]: T[K] extends false ? K : never }[keyof T];
  type ResolveOmitKeys<GO, QO> = Exclude<TrueKeys<GO>, FalseKeys<QO>> | TrueKeys<QO>;

  type ExactKeys<T, Shape> = Shape & { [K in Exclude<keyof T, keyof Shape>]?: never };
  type StrictGlobalOmit<O, Config> = Config & {
    [K in keyof O]?: K extends keyof Config
      ? ExactKeys<NonNullable<O[K]>, NonNullable<Config[K]>>
      : never;
  };

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
