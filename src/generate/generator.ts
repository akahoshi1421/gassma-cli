import { getGassmaAnyUse } from "./typeGenerate/gassmaAnyUse";
import { getGassmaController } from "./typeGenerate/gassmaController";
import { getGassmaCreate } from "./typeGenerate/gassmaCreate";
import { getGassmaCreateMany } from "./typeGenerate/gassmaCreateMany";
import { getGassmaFilterCoditions } from "./typeGenerate/gassmaFilterConditions";
import { getGassmaMain } from "./typeGenerate/gassmaMain";
import { getGassmaSheet } from "./typeGenerate/gassmaSheet";
import { getGassmaUpdateManyData } from "./typeGenerate/gassmaUpdateManyData";
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
  result += getGassmaUpdateManyData(sheetNames);

  return result;
};

export { generater };
