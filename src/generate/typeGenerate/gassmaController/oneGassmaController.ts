const getOneGassmaController = (schemaName: string, sheetName: string) => {
  return `
declare class Gassma${schemaName}${sheetName}Controller {
  constructor(sheetName: string, id?: string);

  readonly fields: Record<string, Gassma.FieldRef>;
  changeSettings(
    startRowNumber: number,
    startColumnNumber: number,
    endColumnNumber: number
  ): void;
  createMany(createdData: Gassma${schemaName}${sheetName}CreateManyData): CreateManyReturn;
  createManyAndReturn(createdData: Gassma${schemaName}${sheetName}CreateManyData): Record<string, unknown>[];
  create<T extends Gassma${schemaName}${sheetName}CreateData>(createdData: T): Gassma${schemaName}${sheetName}FindResult<T["select"]>;
  findFirst<T extends Gassma${schemaName}${sheetName}FindData>(findData: T): Gassma${schemaName}${sheetName}FindResult<T["select"]> | null;
  findFirstOrThrow<T extends Gassma${schemaName}${sheetName}FindData>(findData: T): Gassma${schemaName}${sheetName}FindResult<T["select"]>;
  findMany<T extends Gassma${schemaName}${sheetName}FindManyData>(findData: T): Gassma${schemaName}${sheetName}FindResult<T["select"]>[];
  update<T extends Gassma${schemaName}${sheetName}UpdateSingleData>(updateData: T): Gassma${schemaName}${sheetName}FindResult<T["select"]> | null;
  updateMany(updateData: Gassma${schemaName}${sheetName}UpdateData): UpdateManyReturn;
  updateManyAndReturn(updateData: Gassma${schemaName}${sheetName}UpdateData): Record<string, unknown>[];
  upsert<T extends Gassma${schemaName}${sheetName}UpsertSingleData>(upsertData: T): Gassma${schemaName}${sheetName}FindResult<T["select"]>;
  upsertMany(upsertData: Gassma${schemaName}${sheetName}UpsertData): UpsertManyReturn;
  delete<T extends Gassma${schemaName}${sheetName}DeleteSingleData>(deleteData: T): Gassma${schemaName}${sheetName}FindResult<T["select"]> | null;
  deleteMany(deleteData: Gassma${schemaName}${sheetName}DeleteData): DeleteManyReturn;
  aggregate<T extends Gassma${schemaName}${sheetName}AggregateData>(aggregateData: T): Gassma${schemaName}${sheetName}AggregateResult<T>;
  count(coutData: Gassma${schemaName}${sheetName}CountData): number;
  groupBy<T extends Gassma${schemaName}${sheetName}GroupByData>(groupByData: T): Gassma${schemaName}${sheetName}GroupByResult<T>[];
}
`;
};

export { getOneGassmaController };
