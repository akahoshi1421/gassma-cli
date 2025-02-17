import { getGassmaAggregateData } from "./typeGenerate/gassmaAggregateData";
import { getGassmaAnyUse } from "./typeGenerate/gassmaAnyUse";
import { getGassmaController } from "./typeGenerate/gassmaController";
import { getGassmaCountData } from "./typeGenerate/gassmaCountData";
import { getGassmaCreate } from "./typeGenerate/gassmaCreate";
import { getGassmaCreateMany } from "./typeGenerate/gassmaCreateMany";
import { getGassmaCreateReturn } from "./typeGenerate/gassmaCreateReturn";
import { getGassmaDeleteData } from "./typeGenerate/gassmaDeleteData";
import { getGassmaFilterCoditions } from "./typeGenerate/gassmaFilterConditions";
import { getGassmaFindData } from "./typeGenerate/gassmaFindData";
import { getGassmaFindManyData } from "./typeGenerate/gassmaFindManyData";
import { getGassmaHavingCore } from "./typeGenerate/gassmaHavingCore";
import { getGassmaMain } from "./typeGenerate/gassmaMain";
import { getGassmaManyCount } from "./typeGenerate/gassmaManyCount";
import { getGassmaOrderBy } from "./typeGenerate/gassmaOrderBy";
import { getGassmaSelect } from "./typeGenerate/gassmaSelect";
import { getGassmaSheet } from "./typeGenerate/gassmaSheet";
import { getGassmaUpdateData } from "./typeGenerate/gassmaUpdateData";
import { getGassmaUpsertData } from "./typeGenerate/gassmaUpsertData";
import { getGassmaWhereUse } from "./typeGenerate/gassmaWhereUse";

const generater = (dictYaml: Record<string, Record<string, unknown[]>>) => {
  let result = getGassmaMain();

  const sheetNames = Object.keys(dictYaml);
  result += getGassmaSheet(sheetNames);
  result += getGassmaController(sheetNames);
  result += getGassmaManyCount();
  result += getGassmaAnyUse(dictYaml);
  result += getGassmaCreate(sheetNames);
  result += getGassmaCreateMany(sheetNames);
  result += getGassmaFilterCoditions(dictYaml);
  result += getGassmaWhereUse(dictYaml);
  result += getGassmaHavingCore(dictYaml);
  result += getGassmaFindData(dictYaml);
  result += getGassmaFindManyData(sheetNames);
  result += getGassmaUpdateData(sheetNames);
  result += getGassmaUpsertData(sheetNames);
  result += getGassmaDeleteData(sheetNames);
  result += getGassmaAggregateData(sheetNames);
  result += getGassmaOrderBy(dictYaml);
  result += getGassmaSelect(dictYaml);
  result += getGassmaCountData(sheetNames);
  result += getGassmaCreateReturn(dictYaml);

  return result;
};

export { generater };
