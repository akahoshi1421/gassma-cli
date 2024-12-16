import { getGassmaAnyUse } from "./typeGenerate/gassmaAnyUse";
import { getGassmaController } from "./typeGenerate/gassmaController";
import { getGassmaMain } from "./typeGenerate/gassmaMain";
import { getGassmaSheet } from "./typeGenerate/gassmaSheet";

const generater = (dictYaml: Record<string, Record<string, unknown[]>>) => {
  let result = getGassmaMain();

  const sheetNames = Object.keys(dictYaml);
  result += getGassmaSheet(sheetNames);
  result += getGassmaController(sheetNames);
  result += getGassmaAnyUse(dictYaml);

  return result;
};

export { generater };
