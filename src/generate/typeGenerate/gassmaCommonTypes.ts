const getGassmaCommonTypes = () => {
  return `  type RelationsConfig = Record<string, Record<string, unknown>>;

  type IncludeData = {
    [relationName: string]: unknown;
  };

  type CountSelectItem = true | { where?: Record<string, unknown> };
  type CountSelect = { select: { [relationName: string]: CountSelectItem } };
  type CountValue = true | CountSelect;

  type NumberOperation = {
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
  };

  type NestedWriteOperation = {
    create?: unknown;
    connect?: unknown;
    connectOrCreate?: unknown;
    update?: unknown;
    delete?: unknown;
    deleteMany?: unknown;
    disconnect?: unknown;
    set?: unknown;
  };

  type SortOrderInput = {
    sort: "asc" | "desc";
    nulls?: "first" | "last";
  };

  type RelationOrderBy = {
    [key: string]: "asc" | "desc";
  };

  type RelationListFilter = {
    some?: Record<string, unknown>;
    every?: Record<string, unknown>;
    none?: Record<string, unknown>;
  };

  type RelationSingleFilter = {
    is?: Record<string, unknown>;
    isNot?: Record<string, unknown>;
  };

  type TrueKeys<T> = { [K in keyof T]: T[K] extends true ? K : never }[keyof T];
  type FalseKeys<T> = { [K in keyof T]: T[K] extends false ? K : never }[keyof T];
  type ResolveOmitKeys<GO, QO> = Exclude<TrueKeys<GO>, FalseKeys<QO>> | TrueKeys<QO>;

  type ManyReturn = {
    count: number;
  };

  type CreateManyReturn = ManyReturn;
  type UpdateManyReturn = ManyReturn;
  type DeleteManyReturn = ManyReturn;
  type UpsertManyReturn = ManyReturn;
`;
};

export { getGassmaCommonTypes };
