import fs from "fs";
import path from "path";
import { createJiti } from "jiti";
import { ConfigFileNotFoundError } from "../error/mainError";
import type { GassmaConfig } from "./defineConfig";
import { findConfigFile } from "./findConfigFile";

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
  const mod = jiti(filePath);
  const config: GassmaConfig = mod.default ?? mod;

  return { config, filePath };
};

export { loadConfig };
export type { LoadedConfig };
