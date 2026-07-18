import { GassmaConfigLoadError } from "../error/mainError";
import type { GassmaConfig } from "./defineConfig";

const ROOT_KEYS = ["schema", "datasource"];
const DATASOURCE_KEYS = ["url"];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const describeValue = (value: unknown): string => {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (Array.isArray(value)) return "an array";
  return `a ${typeof value}`;
};

const resolveExported = (mod: unknown): unknown => {
  if (!isRecord(mod)) return mod;
  const descriptor = Object.getOwnPropertyDescriptor(mod, "default");
  if (descriptor === undefined) return mod;
  const exported: unknown = descriptor.value;
  return exported;
};

const warnUnknownKeys = (
  record: Record<string, unknown>,
  knownKeys: string[],
  location: string,
): void => {
  const unknownKeys = Object.keys(record).filter(
    (key) => !knownKeys.includes(key) && key !== "__esModule",
  );
  unknownKeys.forEach((key) => {
    console.warn(
      `Warning: Unknown property \`${key}\` in ${location}. ` +
        `Known properties are: ${knownKeys.join(", ")}. It will be ignored.`,
    );
  });
};

const readSchema = (
  record: Record<string, unknown>,
  configPath: string,
): string | undefined => {
  const value = record.schema;
  if (value === undefined) return undefined;
  if (typeof value === "string") return value;
  throw new GassmaConfigLoadError(
    configPath,
    `Expected \`schema\` to be a string, but received ${describeValue(value)}.`,
  );
};

const readDatasource = (
  record: Record<string, unknown>,
  configPath: string,
): { url?: string } | undefined => {
  const value = record.datasource;
  if (value === undefined) return undefined;
  if (!isRecord(value)) {
    throw new GassmaConfigLoadError(
      configPath,
      `Expected \`datasource\` to be an object, but received ${describeValue(value)}.`,
    );
  }
  warnUnknownKeys(value, DATASOURCE_KEYS, `\`datasource\` of ${configPath}`);
  const url = value.url;
  if (url === undefined) return {};
  if (typeof url === "string") return { url };
  throw new GassmaConfigLoadError(
    configPath,
    `Expected \`datasource.url\` to be a string, but received ${describeValue(url)}.`,
  );
};

const parseConfigModule = (mod: unknown, configPath: string): GassmaConfig => {
  const exported = resolveExported(mod);
  if (!isRecord(exported)) {
    throw new GassmaConfigLoadError(
      configPath,
      `Expected the config file to export a config object, but received ${describeValue(exported)}.\n` +
        'Example:\n  export default { schema: "gassma/schema.prisma" };',
    );
  }
  warnUnknownKeys(exported, ROOT_KEYS, configPath);
  const config: GassmaConfig = {};
  const schema = readSchema(exported, configPath);
  if (schema !== undefined) config.schema = schema;
  const datasource = readDatasource(exported, configPath);
  if (datasource !== undefined) config.datasource = datasource;
  return config;
};

export { parseConfigModule };
