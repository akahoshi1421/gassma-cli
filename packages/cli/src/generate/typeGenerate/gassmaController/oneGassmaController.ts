import { getRemovedCantUseVarChar } from "../../util/getRemovedCantUseVarChar";
import { getControllerDocs } from "../tsdoc/docContext";

const getOneGassmaController = (
  schemaName: string,
  sheetName: string,
  columnNames: string[],
  autoincrementFields: string[] = [],
) => {
  const docs = getControllerDocs(
    schemaName,
    sheetName,
    columnNames,
    autoincrementFields,
  );
  const counterField =
    autoincrementFields.length === 0
      ? "never"
      : autoincrementFields.map((name) => `"${name}"`).join(" | ");
  const clean = getRemovedCantUseVarChar(sheetName);
  const self = `Gassma${schemaName}${clean}`;
  const fr = `${self}FindResult`;
  const c = `Gassma.At<CMap, "${clean}">`;
  const res = `${fr}<T["select"], T["include"], T["omit"], GO, O, CMap>`;
  const resNoArg = `${fr}<unknown, unknown, unknown, GO, O, CMap>`;
  const withComputed = (dataSuffix: string) =>
    `${self}${dataSuffix} & Gassma.ComputedArgs<${c}>`;
  const arg = (dataSuffix: string) => `T extends ${withComputed(dataSuffix)}`;
  const sub = (dataSuffix: string) =>
    `T & Gassma.Subset<T, ${withComputed(dataSuffix)}>`;
  // select と include を両方受け付ける操作だけに衝突チェックを足す
  const subExclusive = (dataSuffix: string) =>
    `${sub(dataSuffix)} & Gassma.IncludeSelectCheck<T>`;

  return `
${docs.controllerClass}export declare class ${self}Controller<GO extends ${self}Omit = {}, O = {}, CMap = {}> {
  constructor(sheetName: string, id?: string);

${docs.fields}  readonly fields: Record<string, Gassma.FieldRef>;
${docs.changeSettings}  changeSettings(
    startRowNumber: number,
    startColumnValue: number | string,
    endColumnValue: number | string
  ): void;
${docs.createMany}  createMany(createdData: ${self}CreateManyData): CreateManyReturn;
${docs.createManyAndReturn}  createManyAndReturn<${arg("CreateManyAndReturnData")}>(createdData: ${subExclusive("CreateManyAndReturnData")}): ${res}[];
${docs.create}  create<${arg("CreateData")}>(createdData: ${subExclusive("CreateData")}): ${res};
${docs.findFirst}  findFirst<${arg("FindFirstData")}>(findData: ${subExclusive("FindFirstData")}): ${res} | null;
${docs.findFirstNoArgs}  findFirst(): ${resNoArg} | null;
${docs.findFirstOrThrow}  findFirstOrThrow<${arg("FindFirstData")}>(findData: ${subExclusive("FindFirstData")}): ${res};
${docs.findFirstOrThrowNoArgs}  findFirstOrThrow(): ${resNoArg};
${docs.findMany}  findMany<${arg("FindManyData")}>(findData: ${subExclusive("FindManyData")}): ${res}[];
${docs.findManyNoArgs}  findMany(): ${resNoArg}[];
${docs.update}  update<${arg("UpdateSingleData")}>(updateData: ${subExclusive("UpdateSingleData")}): ${res} | null;
${docs.updateMany}  updateMany(updateData: ${self}UpdateData): UpdateManyReturn;
${docs.updateManyAndReturn}  updateManyAndReturn<${arg("UpdateManyAndReturnData")}>(updateData: ${subExclusive("UpdateManyAndReturnData")}): ${res}[];
${docs.upsert}  upsert<${arg("UpsertSingleData")}>(upsertData: ${subExclusive("UpsertSingleData")}): ${res};
${docs.deleteSingle}  delete<${arg("DeleteSingleData")}>(deleteData: ${subExclusive("DeleteSingleData")}): ${res} | null;
${docs.deleteMany}  deleteMany(deleteData: ${self}DeleteData): DeleteManyReturn;
${docs.deleteManyNoArgs}  deleteMany(): DeleteManyReturn;
${docs.aggregate}  aggregate<T extends ${self}AggregateData>(aggregateData: T & Gassma.Subset<T, ${self}AggregateData>): ${self}AggregateResult<T>;
${docs.count}  count<T extends ${self}CountData>(countData: T & Gassma.Subset<T, ${self}CountData>): ${self}CountResult<T>;
${docs.countNoArgs}  count(): number;
${docs.groupBy}  groupBy<T extends ${self}GroupByData>(groupByData: T & Gassma.Subset<T, ${self}GroupByData> & Gassma.GroupByPaginationCheck<T, ${self}GroupByData> & Gassma.GroupByOrderByFieldCheck<T>): ${self}GroupByResult<T>[];
${docs.getAutoincrement}  $getAutoincrement(field: ${counterField}): number;
${docs.setAutoincrement}  $setAutoincrement(field: ${counterField}, next: number): void;
${docs.syncAutoincrement}  $syncAutoincrement(field: ${counterField}): number;
}
`;
};

export { getOneGassmaController };
