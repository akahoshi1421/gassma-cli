import { getGassmaAnyUse } from "./typeGenerate/gassmaAnyUse";
import { getGassmaController } from "./typeGenerate/gassmaController";
import { getGassmaCreate } from "./typeGenerate/gassmaCreate";
import { getGassmaCreateMany } from "./typeGenerate/gassmaCreateMany";
import { getGassmaMain } from "./typeGenerate/gassmaMain";
import { getGassmaSheet } from "./typeGenerate/gassmaSheet";

const generater = (dictYaml: Record<string, Record<string, unknown[]>>) => {
  let result = getGassmaMain();

  const sheetNames = Object.keys(dictYaml);
  result += getGassmaSheet(sheetNames);
  result += getGassmaController(sheetNames);
  result += getGassmaAnyUse(dictYaml);
  result += getGassmaCreate(sheetNames);
  result += getGassmaCreateMany(sheetNames);

  return result;
};

export { generater };
