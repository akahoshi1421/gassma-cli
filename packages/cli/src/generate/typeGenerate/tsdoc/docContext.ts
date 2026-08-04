import { renderDocBlock } from "./docBlock";
import { getModelNaming } from "./modelNaming";
import { getCreateDocLines } from "./operations/createDocs";
import { getDeleteDocLines } from "./operations/deleteDocs";
import {
  changeSettingsDocLines,
  controllerClassDocLines,
  fieldsDocLines,
  rowTypeDocLines,
  sheetPropertyDocLines,
} from "./operations/modelDocs";
import { getReadDocLines } from "./operations/readDocs";
import { getStatisticsDocLines } from "./operations/statisticsDocs";
import { getUpdateDocLines } from "./operations/updateDocs";

const MEMBER_INDENT = "  ";

const getControllerDocs = (
  schemaName: string,
  sheetName: string,
  columnNames: string[],
) => {
  const naming = getModelNaming(schemaName, sheetName, columnNames);
  const member = (lines: string[]) => renderDocBlock(MEMBER_INDENT, lines);
  const create = getCreateDocLines(naming);
  const read = getReadDocLines(naming);
  const update = getUpdateDocLines(naming);
  const remove = getDeleteDocLines(naming);
  const statistics = getStatisticsDocLines(naming);

  return {
    controllerClass: renderDocBlock("", controllerClassDocLines(naming)),
    fields: member(fieldsDocLines(naming)),
    changeSettings: member(changeSettingsDocLines()),
    createMany: member(create.createMany),
    createManyAndReturn: member(create.createManyAndReturn),
    create: member(create.create),
    findFirst: member(read.findFirst),
    findFirstNoArgs: member(read.findFirstNoArgs),
    findFirstOrThrow: member(read.findFirstOrThrow),
    findFirstOrThrowNoArgs: member(read.findFirstOrThrowNoArgs),
    findMany: member(read.findMany),
    findManyNoArgs: member(read.findManyNoArgs),
    update: member(update.update),
    updateMany: member(update.updateMany),
    updateManyAndReturn: member(update.updateManyAndReturn),
    upsert: member(update.upsert),
    deleteSingle: member(remove.deleteSingle),
    deleteMany: member(remove.deleteMany),
    deleteManyNoArgs: member(remove.deleteManyNoArgs),
    aggregate: member(statistics.aggregate),
    count: member(statistics.count),
    countNoArgs: member(statistics.countNoArgs),
    groupBy: member(statistics.groupBy),
  };
};

const getSheetPropertyDoc = (schemaName: string, sheetName: string) =>
  renderDocBlock(
    MEMBER_INDENT,
    sheetPropertyDocLines(getModelNaming(schemaName, sheetName, [])),
  );

const getRowTypeDoc = (schemaName: string, sheetName: string) =>
  renderDocBlock(
    "",
    rowTypeDocLines(getModelNaming(schemaName, sheetName, [])),
  );

export { getControllerDocs, getRowTypeDoc, getSheetPropertyDoc };
