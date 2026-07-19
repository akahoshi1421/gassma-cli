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

  type At<X, K> = K extends keyof X ? X[K] : {};
  type MergeShape<A, B> = Omit<A, keyof B> & B;
  type ComputedReturns<Fields> = {
    [F in keyof Fields]: Fields[F] extends { compute: (...args: never[]) => infer V } ? V : never;
  };
  type ComputedOf<R, M> = MergeShape<ComputedReturns<At<R, "$allModels">>, ComputedReturns<At<R, M>>>;
  type SlotReturns<Slots> = {
    [F in keyof Slots]: Slots[F] extends (...args: never[]) => infer V ? V : never;
  };
  type ResultField<Scalars, S, CKeys extends PropertyKey = never, CTypes = {}> = {
    needs?: { [K in keyof S]: K extends keyof Scalars | CKeys ? S[K] : never } & { [K in keyof Scalars]?: boolean } & { [K in CKeys]?: boolean };
    compute(record: { [K in keyof S as S[K] extends true ? K & (keyof Scalars | CKeys) : never]: K extends keyof CTypes ? CTypes[K] : K extends keyof Scalars ? Scalars[K] : never }): unknown;
  };
  type ComputedArgs<C> = [keyof C] extends [never] ? {} : {
    select?: { [K in keyof C]?: true };
    omit?: { [K in keyof C]?: true | false };
  };
  type SelectedComputed<C, S> = {
    [K in keyof C as K extends keyof S ? (S[K] extends true ? K : never) : never]: C[K];
  };
  type ActiveComputed<C, QO> = { [K in keyof C as K extends TrueKeys<QO> ? never : K]: C[K] };
  type StripComputed<S, C> = [keyof C] extends [never]
    ? S
    : S extends object ? { [K in Exclude<keyof S, keyof C>]: S[K] } : S;
  type WithComputed<Base, C, S, QO> = [keyof C] extends [never]
    ? Base
    : S extends object
      ? Omit<Base, keyof SelectedComputed<C, S>> & SelectedComputed<C, S>
      : Omit<Base, keyof ActiveComputed<C, QO>> & ActiveComputed<C, QO>;

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
