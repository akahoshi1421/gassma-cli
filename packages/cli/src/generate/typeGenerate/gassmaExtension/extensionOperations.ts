type ExtensionOperation = {
  name: string;
  dataSuffix: string;
  generic: boolean;
  result: (self: string) => string;
};

const genericFindResult = (self: string) =>
  `${self}FindResultBase<T["select"], T["include"], T["omit"], GO, O>`;

const EXTENSION_OPERATIONS: ExtensionOperation[] = [
  {
    name: "findFirst",
    dataSuffix: "FindFirstData",
    generic: true,
    result: (self) => `${genericFindResult(self)} | null`,
  },
  {
    name: "findFirstOrThrow",
    dataSuffix: "FindFirstData",
    generic: true,
    result: (self) => genericFindResult(self),
  },
  {
    name: "findMany",
    dataSuffix: "FindManyData",
    generic: true,
    result: (self) => `${genericFindResult(self)}[]`,
  },
  {
    name: "create",
    dataSuffix: "CreateData",
    generic: true,
    result: (self) => genericFindResult(self),
  },
  {
    name: "createMany",
    dataSuffix: "CreateManyData",
    generic: false,
    result: () => "CreateManyReturn",
  },
  {
    name: "createManyAndReturn",
    dataSuffix: "CreateManyAndReturnData",
    generic: true,
    result: (self) => `${genericFindResult(self)}[]`,
  },
  {
    name: "update",
    dataSuffix: "UpdateSingleData",
    generic: true,
    result: (self) => `${genericFindResult(self)} | null`,
  },
  {
    name: "updateMany",
    dataSuffix: "UpdateData",
    generic: false,
    result: () => "UpdateManyReturn",
  },
  {
    name: "updateManyAndReturn",
    dataSuffix: "UpdateData",
    generic: false,
    result: (self) =>
      `${self}FindResultBase<undefined, undefined, undefined, GO, O>[]`,
  },
  {
    name: "upsert",
    dataSuffix: "UpsertSingleData",
    generic: true,
    result: (self) => genericFindResult(self),
  },
  {
    name: "delete",
    dataSuffix: "DeleteSingleData",
    generic: true,
    result: (self) => `${genericFindResult(self)} | null`,
  },
  {
    name: "deleteMany",
    dataSuffix: "DeleteData",
    generic: false,
    result: () => "DeleteManyReturn",
  },
  {
    name: "count",
    dataSuffix: "CountData",
    generic: false,
    result: () => "number",
  },
  {
    name: "aggregate",
    dataSuffix: "AggregateData",
    generic: true,
    result: (self) => `${self}AggregateResult<T>`,
  },
  {
    name: "groupBy",
    dataSuffix: "GroupByData",
    generic: true,
    result: (self) => `${self}GroupByResult<T>[]`,
  },
];

const toUnion = (members: string[]): string => {
  const unique = members.filter(
    (member, index) => members.indexOf(member) === index,
  );
  if (unique.length === 0) return "  | never";
  return unique.map((member) => `  | ${member}`).join("\n");
};

export { EXTENSION_OPERATIONS, toUnion };
export type { ExtensionOperation };
