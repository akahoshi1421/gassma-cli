const getOneGassmaController = (sheetName: string) => {
  return `
export class Gassma${sheetName}Controller {
  constructor(sheetName: string, id?: string);

  changeSettings(
    startRowNumber: number,
    startColumnNumber: number,
    endColumnNumber: number
  ): void;
  createMany(createdData: Gassma${sheetName}CreateManyData): CreateManyReturn;
  create(createdData: Gassma${sheetName}CreateData): Gassma${sheetName}CreateReturn;
  findFirst<T extends Gassma${sheetName}FindData>(findData: T): Gassma${sheetName}FindResult<T["select"]>;
  findMany<T extends Gassma${sheetName}FindManyData>(findData: T): Gassma${sheetName}FindResult<T["select"]>[];
  updateMany(updateData: Gassma${sheetName}UpdateData): UpdateManyReturn;
  upsert(upsertData: Gassma${sheetName}UpsertData): UpsertManyReturn;
  deleteMany(deleteData: Gassma${sheetName}DeleteData): DeleteManyReturn;
  aggregate<T extends Gassma${sheetName}AggregateData>(aggregateData: T): Gassma${sheetName}AggregateResult<T>;
  count(coutData: Gassma${sheetName}CountData): number;
  groupBy(groupByData: Gassma${sheetName}GroupByData): Gassma${sheetName}GroupByResult[];
}
`;
};

export { getOneGassmaController };
