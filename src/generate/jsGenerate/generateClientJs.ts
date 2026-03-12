import type { RelationsConfig } from "../read/extractRelations";
import type { DefaultsConfig } from "../read/extractDefaults";
import type { UpdatedAtConfig } from "../read/extractUpdatedAt";
import type { IgnoreConfig } from "../read/extractIgnore";
import type { MapConfig } from "../read/extractMap";
import type { MapSheetsConfig } from "../read/extractMapSheets";

const FUNCTION_MAP: Record<string, string> = {
  now: "() => new Date()",
  uuid: "() => Utilities.getUuid()",
};

const serializeDefaults = (defaults: DefaultsConfig): string => {
  const entries = Object.keys(defaults).map((modelName) => {
    const fields = defaults[modelName];
    const fieldEntries = Object.keys(fields).map((fieldName) => {
      const info = fields[fieldName];
      if (info.kind === "static") {
        return `      "${fieldName}": ${JSON.stringify(info.value)}`;
      }
      const funcStr = FUNCTION_MAP[info.name] ?? `() => null`;
      return `      "${fieldName}": ${funcStr}`;
    });
    return `    "${modelName}": {\n${fieldEntries.join(",\n")}\n    }`;
  });
  return `{\n${entries.join(",\n")}\n  }`;
};

const serializeUpdatedAt = (updatedAt: UpdatedAtConfig): string => {
  const entries = Object.keys(updatedAt).map((modelName) => {
    const fields = updatedAt[modelName];
    const values = fields.map((f) => `"${f}"`).join(", ");
    return `    "${modelName}": [${values}]`;
  });
  return `{\n${entries.join(",\n")}\n  }`;
};

const serializeIgnore = (ignore: IgnoreConfig): string => {
  const entries = Object.keys(ignore).map((modelName) => {
    const fields = ignore[modelName];
    const values = fields.map((f) => `"${f}"`).join(", ");
    return `    "${modelName}": [${values}]`;
  });
  return `{\n${entries.join(",\n")}\n  }`;
};

const serializeIgnoreSheets = (ignoreSheets: string[]): string => {
  const values = ignoreSheets.map((s) => `"${s}"`).join(", ");
  return `[${values}]`;
};

const serializeMapSheets = (mapSheets: MapSheetsConfig): string => {
  const entries = Object.keys(mapSheets).map((modelName) => {
    return `    "${modelName}": "${mapSheets[modelName]}"`;
  });
  return `{\n${entries.join(",\n")}\n  }`;
};

const serializeMap = (map: MapConfig): string => {
  const entries = Object.keys(map).map((modelName) => {
    const fields = map[modelName];
    const fieldEntries = Object.keys(fields).map((codeName) => {
      return `      "${codeName}": "${fields[codeName]}"`;
    });
    return `    "${modelName}": {\n${fieldEntries.join(",\n")}\n    }`;
  });
  return `{\n${entries.join(",\n")}\n  }`;
};

const generateClientJs = (
  relations: RelationsConfig,
  schemaName: string,
  defaults?: DefaultsConfig,
  updatedAt?: UpdatedAtConfig,
  ignore?: IgnoreConfig,
  map?: MapConfig,
  ignoreSheets?: string[],
  mapSheets?: MapSheetsConfig,
): string => {
  const lowerName = schemaName.charAt(0).toLowerCase() + schemaName.slice(1);
  const relationsJson =
    Object.keys(relations).length === 0
      ? "{}"
      : JSON.stringify(relations, null, 2);

  const hasDefaults = defaults && Object.keys(defaults).length > 0;
  const hasUpdatedAt = updatedAt && Object.keys(updatedAt).length > 0;
  const hasIgnore = ignore && Object.keys(ignore).length > 0;
  const hasMap = map && Object.keys(map).length > 0;
  const hasIgnoreSheets = ignoreSheets && ignoreSheets.length > 0;
  const hasMapSheets = mapSheets && Object.keys(mapSheets).length > 0;

  const defaultsDecl = hasDefaults
    ? `const ${lowerName}Defaults = ${serializeDefaults(defaults)};\n\n`
    : "";

  const updatedAtDecl = hasUpdatedAt
    ? `const ${lowerName}UpdatedAt = ${serializeUpdatedAt(updatedAt)};\n\n`
    : "";

  const ignoreDecl = hasIgnore
    ? `const ${lowerName}Ignore = ${serializeIgnore(ignore)};\n\n`
    : "";

  const mapDecl = hasMap
    ? `const ${lowerName}Map = ${serializeMap(map)};\n\n`
    : "";

  const ignoreSheetsDecl = hasIgnoreSheets
    ? `const ${lowerName}IgnoreSheets = ${serializeIgnoreSheets(ignoreSheets)};\n\n`
    : "";

  const mapSheetsDecl = hasMapSheets
    ? `const ${lowerName}MapSheets = ${serializeMapSheets(mapSheets)};\n\n`
    : "";

  const mergeProps = [`relations: ${lowerName}Relations`];
  if (hasDefaults) mergeProps.push(`defaults: ${lowerName}Defaults`);
  if (hasUpdatedAt) mergeProps.push(`updatedAt: ${lowerName}UpdatedAt`);
  if (hasIgnore) mergeProps.push(`ignore: ${lowerName}Ignore`);
  if (hasMap) mergeProps.push(`map: ${lowerName}Map`);
  if (hasIgnoreSheets)
    mergeProps.push(`ignoreSheets: ${lowerName}IgnoreSheets`);
  if (hasMapSheets) mergeProps.push(`mapSheets: ${lowerName}MapSheets`);
  const mergeExpr = `Object.assign({}, options, { ${mergeProps.join(", ")} })`;

  return `const ${lowerName}Relations = ${relationsJson};

${defaultsDecl}${updatedAtDecl}${ignoreDecl}${mapDecl}${ignoreSheetsDecl}${mapSheetsDecl}class GassmaClient {
  constructor(options) {
    const mergedOptions = ${mergeExpr};
    const client = new Gassma.GassmaClient(mergedOptions);
    this.sheets = client.sheets;
  }
}

exports.GassmaClient = GassmaClient;
`;
};

export { generateClientJs };
