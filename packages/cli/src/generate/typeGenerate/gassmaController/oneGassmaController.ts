import { getRemovedCantUseVarChar } from "../../util/getRemovedCantUseVarChar";
import { getControllerDocs } from "../tsdoc/docContext";

const getOneGassmaController = (
  schemaName: string,
  sheetName: string,
  columnNames: string[],
) => {
  const docs = getControllerDocs(schemaName, sheetName, columnNames);
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
${docs.createManyAndReturn}  createManyAndReturn<${arg("CreateManyAndReturnData")}>(createdData: ${sub("CreateManyAndReturnData")}): ${res}[];
${docs.create}  create<${arg("CreateData")}>(createdData: ${sub("CreateData")}): ${res};
${docs.findFirst}  findFirst<${arg("FindFirstData")}>(findData: ${sub("FindFirstData")}): ${res} | null;
${docs.findFirstNoArgs}  findFirst(): ${resNoArg} | null;
${docs.findFirstOrThrow}  findFirstOrThrow<${arg("FindFirstData")}>(findData: ${sub("FindFirstData")}): ${res};
${docs.findFirstOrThrowNoArgs}  findFirstOrThrow(): ${resNoArg};
${docs.findMany}  findMany<${arg("FindManyData")}>(findData: ${sub("FindManyData")}): ${res}[];
${docs.findManyNoArgs}  findMany(): ${resNoArg}[];
${docs.update}  update<${arg("UpdateSingleData")}>(updateData: ${sub("UpdateSingleData")}): ${res} | null;
${docs.updateMany}  updateMany(updateData: ${self}UpdateData): UpdateManyReturn;
${docs.updateManyAndReturn}  updateManyAndReturn<${arg("UpdateManyAndReturnData")}>(updateData: ${sub("UpdateManyAndReturnData")}): ${res}[];
${docs.upsert}  upsert<${arg("UpsertSingleData")}>(upsertData: ${sub("UpsertSingleData")}): ${res};
${docs.deleteSingle}  delete<${arg("DeleteSingleData")}>(deleteData: ${sub("DeleteSingleData")}): ${res} | null;
${docs.deleteMany}  deleteMany(deleteData: ${self}DeleteData): DeleteManyReturn;
${docs.deleteManyNoArgs}  deleteMany(): DeleteManyReturn;
${docs.aggregate}  aggregate<T extends ${self}AggregateData>(aggregateData: T & Gassma.Subset<T, ${self}AggregateData>): ${self}AggregateResult<T>;
${docs.count}  count<T extends ${self}CountData>(countData: T & Gassma.Subset<T, ${self}CountData>): ${self}CountResult<T>;
${docs.countNoArgs}  count(): number;
${docs.groupBy}  groupBy<T extends ${self}GroupByData>(groupByData: T & Gassma.Subset<T, ${self}GroupByData>): ${self}GroupByResult<T>[];
}
`;
};

export { getOneGassmaController };
