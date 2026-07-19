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
import { getGassmaCreateManyAndReturnData } from "./typeGenerate/gassmaCreateManyAndReturnData";
import { getGassmaCreateReturn } from "./typeGenerate/gassmaCreateReturn";
import { getGassmaDefaultFindResult } from "./typeGenerate/gassmaDefaultFindResult";
import { getGassmaDeleteData } from "./typeGenerate/gassmaDeleteData";
import { getGassmaDeleteSingleData } from "./typeGenerate/gassmaDeleteSingleData";
import { getGassmaFilterCoditions } from "./typeGenerate/gassmaFilterConditions";
import { getGassmaFindData } from "./typeGenerate/gassmaFindData";
import { getGassmaFindFirstData } from "./typeGenerate/gassmaFindFirstData";
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
  autoincrementModels?: string[],
  optionalFields?: Record<string, string[]>,
  strict?: boolean,
) => {
  const schema = schemaName ?? "";
  const sheetNames = Object.keys(dictYaml);
  let result = getGassmaMain(
    sheetNames,
    schema,
    includeCommon,
    {
      dictYaml,
      defaults: defaults ?? {},
      updatedAtModels: updatedAtModels ?? [],
      autoincrementModels: autoincrementModels ?? [],
    },
    strict,
  );

  result += getGassmaSheet(sheetNames, schema);
  result += getGassmaController(sheetNames, schema);
  if (includeCommon !== false) {
    result += getGassmaManyCount();
  }
  result += getGassmaAnyUse(dictYaml, schema, optionalFields ?? {});
  result += getGassmaCreate(sheetNames, schema, relations, strict);
  result += getGassmaCreateMany(sheetNames, schema, strict);
  result += getGassmaCreateManyAndReturnData(sheetNames, schema, strict);
  result += getGassmaFilterCoditions(dictYaml, schema, strict);
  result += getGassmaWhereUse(dictYaml, schema, relations, strict);
  result += getGassmaHavingCore(dictYaml, schema, strict);
  result += getGassmaHavingUse(dictYaml, schema, strict);
  result += getGassmaFindData(dictYaml, schema, strict);
  result += getGassmaFindFirstData(dictYaml, schema, strict);
  result += getGassmaFindManyData(sheetNames, schema);
  result += getGassmaUpdateData(dictYaml, schema, strict);
  result += getGassmaUpdateSingleData(dictYaml, schema, relations, strict);
  result += getGassmaUpsertSingleData(dictYaml, schema, relations, strict);
  result += getGassmaDeleteData(sheetNames, schema, strict);
  result += getGassmaDeleteSingleData(sheetNames, schema, strict);
  result += getGassmaAggregateData(sheetNames, schema, strict);
  result += getGassmaGroupByData(dictYaml, schema, strict);
  result += getGassmaInclude(sheetNames, schema, relations, strict);
  result += getGassmaCountValue(sheetNames, schema, relations, strict);
  result += getGassmaOrderBy(dictYaml, schema, relations, strict);
  result += getGassmaSelect(dictYaml, schema, relations, strict);
  result += getGassmaOmit(dictYaml, schema, strict);
  result += getGassmaCountData(sheetNames, schema, strict);
  result += getGassmaCreateReturn(dictYaml, schema);
  result += getGassmaDefaultFindResult(sheetNames, schema);
  result += getGassmaFindResult(sheetNames, schema, relations);
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
