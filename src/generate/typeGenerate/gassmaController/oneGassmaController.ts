const getOneGassmaController = (schemaName: string, sheetName: string) => {
  const self = `Gassma${schemaName}${sheetName}`;
  const fr = `${self}FindResult`;
  const base = `${fr}<Gassma.StripComputed<T["select"], C>, T["include"], T["omit"], GO, O>`;
  const res = `Gassma.WithComputed<${base}, C, T["select"], T["omit"]>`;
  const arg = (dataSuffix: string) =>
    `T extends ${self}${dataSuffix} & Gassma.ComputedArgs<C>`;

  return `
export declare class ${self}Controller<GO extends ${self}Omit = {}, O = {}, C = {}> {
  constructor(sheetName: string, id?: string);

  readonly fields: Record<string, Gassma.FieldRef>;
  changeSettings(
    startRowNumber: number,
    startColumnNumber: number,
    endColumnNumber: number
  ): void;
  createMany(createdData: ${self}CreateManyData): CreateManyReturn;
  createManyAndReturn<${arg("CreateManyAndReturnData")}>(createdData: T): ${res}[];
  create<${arg("CreateData")}>(createdData: T): ${res};
  findFirst<${arg("FindFirstData")}>(findData: T): ${res} | null;
  findFirstOrThrow<${arg("FindFirstData")}>(findData: T): ${res};
  findMany<${arg("FindManyData")}>(findData: T): ${res}[];
  update<${arg("UpdateSingleData")}>(updateData: T): ${res} | null;
  updateMany(updateData: ${self}UpdateData): UpdateManyReturn;
  updateManyAndReturn(updateData: ${self}UpdateData): Gassma.WithComputed<${fr}<undefined, undefined, undefined, GO, O>, C, undefined, undefined>[];
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
