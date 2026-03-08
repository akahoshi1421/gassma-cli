import { getGassmaAggregateBaseReturn } from "./typeGenerate/gassmaAggregateBaseReturn";
import { getGassmaAggregateData } from "./typeGenerate/gassmaAggregateData";
import { getGassmaAggregateField } from "./typeGenerate/gassmaAggregateField";
import { getGassmaAggregateResult } from "./typeGenerate/gassmaAggregateResult";
import { getGassmaAnyUse } from "./typeGenerate/gassmaAnyUse";
import { getGassmaByField } from "./typeGenerate/gassmaByField";
import { getGassmaController } from "./typeGenerate/gassmaController";
import { getGassmaCountData } from "./typeGenerate/gassmaCountData";
import { getGassmaCreate } from "./typeGenerate/gassmaCreate";
import { getGassmaCreateMany } from "./typeGenerate/gassmaCreateMany";
import { getGassmaCreateReturn } from "./typeGenerate/gassmaCreateReturn";
import { getGassmaDefaultFindResult } from "./typeGenerate/gassmaDefaultFindResult";
import { getGassmaDeleteData } from "./typeGenerate/gassmaDeleteData";
import { getGassmaDeleteSingleData } from "./typeGenerate/gassmaDeleteSingleData";
import { getGassmaFilterCoditions } from "./typeGenerate/gassmaFilterConditions";
import { getGassmaFindData } from "./typeGenerate/gassmaFindData";
import { getGassmaFindManyData } from "./typeGenerate/gassmaFindManyData";
import { getGassmaFindResult } from "./typeGenerate/gassmaFindResult";
import { getGassmaGroupByBaseReturn } from "./typeGenerate/gassmaGroupByBaseReturn";
import { getGassmaGroupByData } from "./typeGenerate/gassmaGroupByData";
import { getGassmaGroupByKeyOfBaseReturn } from "./typeGenerate/gassmaGroupByKeyOfBaseReturn";
import { getGassmaGroupByResult } from "./typeGenerate/gassmaGroupByResult";
import { getGassmaHavingCore } from "./typeGenerate/gassmaHavingCore";
import { getGassmaHavingUse } from "./typeGenerate/gassmaHavingUse";
import { getGassmaMain } from "./typeGenerate/gassmaMain";
import { getGassmaManyCount } from "./typeGenerate/gassmaManyCount";
import { getGassmaOmit } from "./typeGenerate/gassmaOmit";
import { getGassmaOrderBy } from "./typeGenerate/gassmaOrderBy";
import { getGassmaSelect } from "./typeGenerate/gassmaSelect";
import { getGassmaSheet } from "./typeGenerate/gassmaSheet";
import { getGassmaUpdateData } from "./typeGenerate/gassmaUpdateData";
import { getGassmaUpdateSingleData } from "./typeGenerate/gassmaUpdateSingleData";
import { getGassmaUpsertData } from "./typeGenerate/gassmaUpsertData";
import { getGassmaUpsertSingleData } from "./typeGenerate/gassmaUpsertSingleData";
import { getGassmaWhereUse } from "./typeGenerate/gassmaWhereUse";
import type { RelationsConfig } from "./read/extractRelations";

const generater = (
  dictYaml: Record<string, Record<string, unknown[]>>,
  relations?: RelationsConfig,
) => {
  const sheetNames = Object.keys(dictYaml);
  let result = getGassmaMain(sheetNames);

  result += getGassmaSheet(sheetNames);
  result += getGassmaController(sheetNames);
  result += getGassmaManyCount();
  result += getGassmaAnyUse(dictYaml);
  result += getGassmaCreate(sheetNames, relations);
  result += getGassmaCreateMany(sheetNames);
  result += getGassmaFilterCoditions(dictYaml);
  result += getGassmaWhereUse(dictYaml, relations);
  result += getGassmaHavingCore(dictYaml);
  result += getGassmaHavingUse(dictYaml);
  result += getGassmaFindData(dictYaml);
  result += getGassmaFindManyData(sheetNames);
  result += getGassmaUpdateData(sheetNames, relations);
  result += getGassmaUpdateSingleData(sheetNames, relations);
  result += getGassmaUpsertData(sheetNames);
  result += getGassmaUpsertSingleData(sheetNames, relations);
  result += getGassmaDeleteData(sheetNames);
  result += getGassmaDeleteSingleData(sheetNames);
  result += getGassmaAggregateData(sheetNames);
  result += getGassmaGroupByData(dictYaml);
  result += getGassmaOrderBy(dictYaml);
  result += getGassmaSelect(dictYaml);
  result += getGassmaOmit(dictYaml);
  result += getGassmaCountData(sheetNames);
  result += getGassmaCreateReturn(dictYaml);
  result += getGassmaDefaultFindResult(sheetNames);
  result += getGassmaFindResult(sheetNames);
  result += getGassmaAggregateBaseReturn(dictYaml);
  result += getGassmaAggregateField(sheetNames);
  result += getGassmaAggregateResult(sheetNames);
  result += getGassmaGroupByBaseReturn(sheetNames);
  result += getGassmaGroupByKeyOfBaseReturn(sheetNames);
  result += getGassmaByField(sheetNames);
  result += getGassmaGroupByResult(sheetNames);

  return result;
};

export { generater };
