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
import { getGassmaInclude } from "./typeGenerate/gassmaInclude";
import { getGassmaCountValue } from "./typeGenerate/gassmaCountValue";
import { getGassmaOrderBy } from "./typeGenerate/gassmaOrderBy";
import { getGassmaSelect } from "./typeGenerate/gassmaSelect";
import { getGassmaSheet } from "./typeGenerate/gassmaSheet";
import { getGassmaUpdateData } from "./typeGenerate/gassmaUpdateData";
import { getGassmaUpdateSingleData } from "./typeGenerate/gassmaUpdateSingleData";
import { getGassmaUpsertData } from "./typeGenerate/gassmaUpsertData";
import { getGassmaUpsertSingleData } from "./typeGenerate/gassmaUpsertSingleData";
import { getGassmaWhereUse } from "./typeGenerate/gassmaWhereUse";
import type { DefaultsConfig } from "./read/extractDefaults";
import type { RelationsConfig } from "./read/extractRelations";

const generater = (
  dictYaml: Record<string, Record<string, unknown[]>>,
  relations?: RelationsConfig,
  schemaName?: string,
  includeCommon?: boolean,
  defaults?: DefaultsConfig,
  updatedAtModels?: string[],
) => {
  const schema = schemaName ?? "";
  const sheetNames = Object.keys(dictYaml);
  let result = getGassmaMain(sheetNames, schema, includeCommon, {
    dictYaml,
    defaults: defaults ?? {},
    updatedAtModels: updatedAtModels ?? [],
  });

  result += getGassmaSheet(sheetNames, schema);
  result += getGassmaController(sheetNames, schema);
  if (includeCommon !== false) {
    result += getGassmaManyCount();
  }
  result += getGassmaAnyUse(dictYaml, schema);
  result += getGassmaCreate(sheetNames, schema, relations);
  result += getGassmaCreateMany(sheetNames, schema);
  result += getGassmaFilterCoditions(dictYaml, schema);
  result += getGassmaWhereUse(dictYaml, schema, relations);
  result += getGassmaHavingCore(dictYaml, schema);
  result += getGassmaHavingUse(dictYaml, schema);
  result += getGassmaFindData(dictYaml, schema);
  result += getGassmaFindManyData(sheetNames, schema);
  result += getGassmaUpdateData(sheetNames, schema, relations);
  result += getGassmaUpdateSingleData(sheetNames, schema, relations);
  result += getGassmaUpsertData(sheetNames, schema);
  result += getGassmaUpsertSingleData(sheetNames, schema, relations);
  result += getGassmaDeleteData(sheetNames, schema);
  result += getGassmaDeleteSingleData(sheetNames, schema);
  result += getGassmaAggregateData(sheetNames, schema);
  result += getGassmaGroupByData(dictYaml, schema);
  result += getGassmaInclude(sheetNames, schema, relations);
  result += getGassmaCountValue(sheetNames, schema, relations);
  result += getGassmaOrderBy(dictYaml, schema, relations);
  result += getGassmaSelect(dictYaml, schema);
  result += getGassmaOmit(dictYaml, schema);
  result += getGassmaCountData(sheetNames, schema);
  result += getGassmaCreateReturn(dictYaml, schema);
  result += getGassmaDefaultFindResult(sheetNames, schema);
  result += getGassmaFindResult(sheetNames, schema);
  result += getGassmaAggregateBaseReturn(dictYaml, schema);
  result += getGassmaAggregateField(sheetNames, schema);
  result += getGassmaAggregateResult(sheetNames, schema);
  result += getGassmaGroupByBaseReturn(sheetNames, schema);
  result += getGassmaGroupByKeyOfBaseReturn(sheetNames, schema);
  result += getGassmaByField(sheetNames, schema);
  result += getGassmaGroupByResult(sheetNames, schema);

  return result;
};

export { generater };
