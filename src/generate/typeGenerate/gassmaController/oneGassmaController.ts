const getOneGassmaController = (sheetName: string) => {
  return `
declare class Gassma${sheetName}Controller {
  constructor(sheetName: string, id?: string);

  readonly fields: Record<string, Gassma.FieldRef>;
  changeSettings(
    startRowNumber: number,
    startColumnNumber: number,
    endColumnNumber: number
  ): void;
  createMany(createdData: Gassma${sheetName}CreateManyData): CreateManyReturn;
  createManyAndReturn(createdData: Gassma${sheetName}CreateManyData): Record<string, unknown>[];
  create<T extends Gassma${sheetName}CreateData>(createdData: T): Gassma${sheetName}FindResult<T["select"]>;
  findFirst<T extends Gassma${sheetName}FindData>(findData: T): Gassma${sheetName}FindResult<T["select"]> | null;
  findFirstOrThrow<T extends Gassma${sheetName}FindData>(findData: T): Gassma${sheetName}FindResult<T["select"]>;
  findMany<T extends Gassma${sheetName}FindManyData>(findData: T): Gassma${sheetName}FindResult<T["select"]>[];
  update<T extends Gassma${sheetName}UpdateSingleData>(updateData: T): Gassma${sheetName}FindResult<T["select"]> | null;
  updateMany(updateData: Gassma${sheetName}UpdateData): UpdateManyReturn;
  updateManyAndReturn(updateData: Gassma${sheetName}UpdateData): Record<string, unknown>[];
  upsert(upsertData: Gassma.UpsertSingleData): Record<string, unknown>;
  upsertMany(upsertData: Gassma${sheetName}UpsertData): UpsertManyReturn;
  delete(deleteData: Gassma.DeleteSingleData): Record<string, unknown> | null;
  deleteMany(deleteData: Gassma${sheetName}DeleteData): DeleteManyReturn;
  aggregate<T extends Gassma${sheetName}AggregateData>(aggregateData: T): Gassma${sheetName}AggregateResult<T>;
  count(coutData: Gassma${sheetName}CountData): number;
  groupBy<T extends Gassma${sheetName}GroupByData>(groupByData: T): Gassma${sheetName}GroupByResult<T>[];
}
`;
};

export { getOneGassmaController };
