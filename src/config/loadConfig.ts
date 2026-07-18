import fs from "fs";
import path from "path";
import { createJiti } from "jiti";
import {
  ConfigFileNotFoundError,
  GassmaConfigLoadError,
} from "../error/mainError";
import type { GassmaConfig } from "./defineConfig";
import { findConfigFile } from "./findConfigFile";
import { parseConfigModule } from "./parseConfigModule";

type LoadedConfig = {
  config: GassmaConfig;
  filePath: string;
};

const loadConfig = (configPath?: string): LoadedConfig | undefined => {
  const filePath =
    configPath === undefined
      ? findConfigFile(process.cwd())
      : path.resolve(process.cwd(), configPath);

  if (filePath === undefined) {
    return undefined;
  }

  if (!fs.existsSync(filePath)) {
    throw new ConfigFileNotFoundError(filePath);
  }

  const jiti = createJiti(filePath);
  try {
    const mod: unknown = jiti(filePath);
    return { config: parseConfigModule(mod, filePath), filePath };
  } catch (error) {
    if (error instanceof GassmaConfigLoadError) throw error;
    throw new GassmaConfigLoadError(filePath, error);
  }
};

export { loadConfig };
export type { LoadedConfig };
