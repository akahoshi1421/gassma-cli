const getOneGassmaController = (schemaName: string, sheetName: string) => {
  const self = `Gassma${schemaName}${sheetName}`;
  const fr = `${self}FindResult`;
  const c = `Gassma.At<CMap, "${sheetName}">`;
  const res = `${fr}<T["select"], T["include"], T["omit"], GO, O, CMap>`;
  const arg = (dataSuffix: string) =>
    `T extends ${self}${dataSuffix} & Gassma.ComputedArgs<${c}>`;

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
  createManyAndReturn<${arg("CreateManyAndReturnData")}>(createdData: T): ${res}[];
  create<${arg("CreateData")}>(createdData: T): ${res};
  findFirst<${arg("FindFirstData")}>(findData: T): ${res} | null;
  findFirstOrThrow<${arg("FindFirstData")}>(findData: T): ${res};
  findMany<${arg("FindManyData")}>(findData: T): ${res}[];
  update<${arg("UpdateSingleData")}>(updateData: T): ${res} | null;
  updateMany(updateData: ${self}UpdateData): UpdateManyReturn;
  updateManyAndReturn(updateData: ${self}UpdateData): ${fr}<undefined, undefined, undefined, GO, O, CMap>[];
  upsert<${arg("UpsertSingleData")}>(upsertData: T): ${res};
  delete<${arg("DeleteSingleData")}>(deleteData: T): ${res} | null;
  deleteMany(deleteData: ${self}DeleteData): DeleteManyReturn;
  aggregate<T extends ${self}AggregateData>(aggregateData: T): ${self}AggregateResult<T>;
  count(coutData: ${self}CountData): number;
  groupBy<T extends ${self}GroupByData>(groupByData: T): ${self}GroupByResult<T>[];
}
`;
};

export { getOneGassmaController };
