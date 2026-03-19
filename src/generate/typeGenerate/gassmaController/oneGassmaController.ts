const getOneGassmaController = (schemaName: string, sheetName: string) => {
  const fr = `Gassma${schemaName}${sheetName}FindResult`;
  return `
export declare class Gassma${schemaName}${sheetName}Controller<GO extends Gassma${schemaName}${sheetName}Omit = {}> {
  constructor(sheetName: string, id?: string);

  readonly fields: Record<string, Gassma.FieldRef>;
  changeSettings(
    startRowNumber: number,
    startColumnNumber: number,
    endColumnNumber: number
  ): void;
  createMany(createdData: Gassma${schemaName}${sheetName}CreateManyData): CreateManyReturn;
  createManyAndReturn(createdData: Gassma${schemaName}${sheetName}CreateManyData): Gassma${schemaName}${sheetName}DefaultFindResult[];
  create<T extends Gassma${schemaName}${sheetName}CreateData>(createdData: T): ${fr}<T["select"], T["omit"], GO>;
  findFirst<T extends Gassma${schemaName}${sheetName}FindData>(findData: T): ${fr}<T["select"], T["omit"], GO> | null;
  findFirstOrThrow<T extends Gassma${schemaName}${sheetName}FindData>(findData: T): ${fr}<T["select"], T["omit"], GO>;
  findMany<T extends Gassma${schemaName}${sheetName}FindManyData>(findData: T): ${fr}<T["select"], T["omit"], GO>[];
  update<T extends Gassma${schemaName}${sheetName}UpdateSingleData>(updateData: T): ${fr}<T["select"], T["omit"], GO> | null;
  updateMany(updateData: Gassma${schemaName}${sheetName}UpdateData): UpdateManyReturn;
  updateManyAndReturn(updateData: Gassma${schemaName}${sheetName}UpdateData): Gassma${schemaName}${sheetName}DefaultFindResult[];
  upsert<T extends Gassma${schemaName}${sheetName}UpsertSingleData>(upsertData: T): ${fr}<T["select"], T["omit"], GO>;
  upsertMany(upsertData: Gassma${schemaName}${sheetName}UpsertData): UpsertManyReturn;
  delete<T extends Gassma${schemaName}${sheetName}DeleteSingleData>(deleteData: T): ${fr}<T["select"], T["omit"], GO> | null;
  deleteMany(deleteData: Gassma${schemaName}${sheetName}DeleteData): DeleteManyReturn;
  aggregate<T extends Gassma${schemaName}${sheetName}AggregateData>(aggregateData: T): Gassma${schemaName}${sheetName}AggregateResult<T>;
  count(coutData: Gassma${schemaName}${sheetName}CountData): number;
  groupBy<T extends Gassma${schemaName}${sheetName}GroupByData>(groupByData: T): Gassma${schemaName}${sheetName}GroupByResult<T>[];
}
`;
};

export { getOneGassmaController };
