const getSkipDeclarations = () => {
  return `  const skip: unique symbol;
  type SkipValue = typeof skip;
  type SkipOptional<T> = { [K in keyof T]: {} extends Pick<T, K> ? T[K] | SkipValue : T[K] };

`;
};

const getGassmaCommonTypes = (strict?: boolean) => {
  const skipDecls = strict ? getSkipDeclarations() : "";
  const sk = strict ? " | SkipValue" : "";

  return `${skipDecls}  type RelationsConfig = Record<string, Record<string, unknown>>;

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
    equals?: T | FieldRef${sk};
    not?: T${sk};
    in?: T[]${sk};
    notIn?: T[]${sk};
    lt?: T | FieldRef${sk};
    lte?: T | FieldRef${sk};
    gt?: T | FieldRef${sk};
    gte?: T | FieldRef${sk};
    contains?: string | FieldRef${sk};
    startsWith?: string | FieldRef${sk};
    endsWith?: string | FieldRef${sk};
    mode?: "default" | "insensitive"${sk};
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
