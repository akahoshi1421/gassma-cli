const getOneGassmaController = (schemaName: string, sheetName: string) => {
  const self = `Gassma${schemaName}${sheetName}`;
  const fr = `${self}FindResult`;
  const c = `Gassma.At<CMap, "${sheetName}">`;
  const res = `${fr}<T["select"], T["include"], T["omit"], GO, O, CMap>`;
  const resNoArg = `${fr}<unknown, unknown, unknown, GO, O, CMap>`;
  const withComputed = (dataSuffix: string) =>
    `${self}${dataSuffix} & Gassma.ComputedArgs<${c}>`;
  const arg = (dataSuffix: string) => `T extends ${withComputed(dataSuffix)}`;
  const sub = (dataSuffix: string) =>
    `T & Gassma.Subset<T, ${withComputed(dataSuffix)}>`;

  return `
export declare class ${self}Controller<GO extends ${self}Omit = {}, O = {}, CMap = {}> {
  constructor(sheetName: string, id?: string);

  readonly fields: Record<string, Gassma.FieldRef>;
  changeSettings(
    startRowNumber: number,
    startColumnValue: number | string,
    endColumnValue: number | string
  ): void;
  createMany(createdData: ${self}CreateManyData): CreateManyReturn;
  createManyAndReturn<${arg("CreateManyAndReturnData")}>(createdData: ${sub("CreateManyAndReturnData")}): ${res}[];
  create<${arg("CreateData")}>(createdData: ${sub("CreateData")}): ${res};
  findFirst<${arg("FindFirstData")}>(findData: ${sub("FindFirstData")}): ${res} | null;
  findFirst(): ${resNoArg} | null;
  findFirstOrThrow<${arg("FindFirstData")}>(findData: ${sub("FindFirstData")}): ${res};
  findFirstOrThrow(): ${resNoArg};
  findMany<${arg("FindManyData")}>(findData: ${sub("FindManyData")}): ${res}[];
  findMany(): ${resNoArg}[];
  update<${arg("UpdateSingleData")}>(updateData: ${sub("UpdateSingleData")}): ${res} | null;
  updateMany(updateData: ${self}UpdateData): UpdateManyReturn;
  updateManyAndReturn(updateData: ${self}UpdateData): ${fr}<undefined, undefined, undefined, GO, O, CMap>[];
  upsert<${arg("UpsertSingleData")}>(upsertData: ${sub("UpsertSingleData")}): ${res};
  delete<${arg("DeleteSingleData")}>(deleteData: ${sub("DeleteSingleData")}): ${res} | null;
  deleteMany(deleteData: ${self}DeleteData): DeleteManyReturn;
  deleteMany(): DeleteManyReturn;
  aggregate<T extends ${self}AggregateData>(aggregateData: T & Gassma.Subset<T, ${self}AggregateData>): ${self}AggregateResult<T>;
  count(coutData: ${self}CountData): number;
  count(): number;
  groupBy<T extends ${self}GroupByData>(groupByData: T & Gassma.Subset<T, ${self}GroupByData>): ${self}GroupByResult<T>[];
}
`;
};

export { getOneGassmaController };
