import type { RelationsConfig } from "../read/extractRelations";
import type { DefaultsConfig } from "../read/extractDefaults";

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

const generateClientJs = (
  relations: RelationsConfig,
  schemaName: string,
  defaults?: DefaultsConfig,
): string => {
  const lowerName = schemaName.charAt(0).toLowerCase() + schemaName.slice(1);
  const relationsJson =
    Object.keys(relations).length === 0
      ? "{}"
      : JSON.stringify(relations, null, 2);

  const hasDefaults = defaults && Object.keys(defaults).length > 0;

  const defaultsDecl = hasDefaults
    ? `const ${lowerName}Defaults = ${serializeDefaults(defaults)};\n\n`
    : "";

  const mergeExpr = hasDefaults
    ? `Object.assign({}, options, { relations: ${lowerName}Relations, defaults: ${lowerName}Defaults })`
    : `Object.assign({}, options, { relations: ${lowerName}Relations })`;

  return `const ${lowerName}Relations = ${relationsJson};

${defaultsDecl}class GassmaClient {
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
