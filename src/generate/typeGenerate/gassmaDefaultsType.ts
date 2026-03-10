import type { DefaultsConfig } from "../read/extractDefaults";
import { getColumnType } from "../util/getColumnType";

const findFieldType = (
  fields: Record<string, unknown[]>,
  fieldName: string,
): string | undefined => {
  const optionalKey = `${fieldName}?`;
  const types = fields[fieldName] ?? fields[optionalKey];
  if (!types) return undefined;
  return getColumnType(types);
};

const getGassmaDefaultsType = (
  dictYaml: Record<string, Record<string, unknown[]>>,
  defaults: DefaultsConfig,
  schemaName: string,
): string => {
  const modelNames = Object.keys(defaults);
  if (modelNames.length === 0) {
    return `declare type Gassma${schemaName}DefaultsConfig = {};\n`;
  }

  const body = modelNames.reduce((pre, modelName) => {
    const modelDefaults = defaults[modelName];
    const fields = dictYaml[modelName];
    if (!fields) return pre;

    const fieldEntries = Object.keys(modelDefaults).reduce((acc, fieldName) => {
      const tsType = findFieldType(fields, fieldName);
      if (!tsType) return acc;
      return `${acc}    "${fieldName}"?: ${tsType} | (() => ${tsType});\n`;
    }, "");

    return `${pre}  "${modelName}"?: {\n${fieldEntries}  };\n`;
  }, "");

  return `declare type Gassma${schemaName}DefaultsConfig = {\n${body}};\n`;
};

export { getGassmaDefaultsType };
