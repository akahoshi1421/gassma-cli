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
  create(createdData: Gassma${sheetName}CreateData): void;
  findFirst(findData: Gassma${sheetName}FindData): Gassma${sheetName}FindResult;
  findMany(findData: Gassma${sheetName}FindManyData): Gassma${sheetName}FindResult[];
  updateMany(updateData: Gassma${sheetName}UpdateData): UpdateManyReturn;
  upsert(upsertData: Gassma${sheetName}UpsertData): UpsertManyReturn;
  deleteMany(deleteData: Gassma${sheetName}DeleteData): DeleteManyReturn;
  aggregate(aggregateData: Gassma${sheetName}AggregateData): Gassma${sheetName}AggregateResult;
  count(coutData: Gassma${sheetName}CountData): number;
  groupBy(groupByData: Gassma${sheetName}GroupByData): Gassma${sheetName}GroupByResult[];
}
`;
};

export { getOneGassmaController };
