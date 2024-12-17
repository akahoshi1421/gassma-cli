import { getGassmaAnyUse } from "./typeGenerate/gassmaAnyUse";
import { getGassmaController } from "./typeGenerate/gassmaController";
import { getGassmaCreate } from "./typeGenerate/gassmaCreate";
import { getGassmaCreateMany } from "./typeGenerate/gassmaCreateMany";
import { getGassmaDeleteData } from "./typeGenerate/gassmaDeleteData";
import { getGassmaFilterCoditions } from "./typeGenerate/gassmaFilterConditions";
import { getGassmaMain } from "./typeGenerate/gassmaMain";
import { getGassmaOrderBy } from "./typeGenerate/gassmaOrderBy";
import { getGassmaSheet } from "./typeGenerate/gassmaSheet";
import { getGassmaUpdateData } from "./typeGenerate/gassmaUpdateData";
import { getGassmaUpsertData } from "./typeGenerate/gassmaUpsertData";
import { getGassmaWhereUse } from "./typeGenerate/gassmaWhereUse";

const generater = (dictYaml: Record<string, Record<string, unknown[]>>) => {
  let result = getGassmaMain();

  const sheetNames = Object.keys(dictYaml);
  result += getGassmaSheet(sheetNames);
  result += getGassmaController(sheetNames);
  result += getGassmaAnyUse(dictYaml);
  result += getGassmaCreate(sheetNames);
  result += getGassmaCreateMany(sheetNames);
  result += getGassmaFilterCoditions(dictYaml);
  result += getGassmaWhereUse(dictYaml);
  result += getGassmaUpdateData(sheetNames);
  result += getGassmaUpsertData(sheetNames);
  result += getGassmaDeleteData(sheetNames);
  result += getGassmaOrderBy(dictYaml);

  return result;
};

export { generater };
