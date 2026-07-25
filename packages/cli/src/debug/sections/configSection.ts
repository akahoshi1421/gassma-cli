import { CONFIG_EXTENSIONS } from "../../config/findConfigFile";
import { loadConfig } from "../../config/loadConfig";
import { firstLine } from "../util/firstLine";

type ConfigStatus =
  | { kind: "loaded"; filePath: string }
  | { kind: "notFound" }
  | { kind: "error"; message: string };

const collectConfigStatus = (configPath: string | undefined): ConfigStatus => {
  try {
    const loaded = loadConfig(configPath);
    if (loaded === undefined) return { kind: "notFound" };
    return { kind: "loaded", filePath: loaded.filePath };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { kind: "error", message: firstLine(message) };
  }
};

const describeSearchedLocations = (): string => {
  const exts = CONFIG_EXTENSIONS.map((ext) => ext.slice(1)).join(",");
  return `gassma.config.{${exts}}, .config/gassma.{${exts}}`;
};

const buildConfigLine = (
  status: Exclude<ConfigStatus, { kind: "loaded" }>,
): string => {
  if (status.kind === "notFound") {
    return `No config file found (searched: ${describeSearchedLocations()})`;
  }
  return `Failed to load config: ${status.message}`;
};

export { buildConfigLine, collectConfigStatus };
export type { ConfigStatus };
