import fs from "fs";
import path from "path";
import { createJiti } from "jiti";
import { ConfigFileNotFoundError } from "../error/mainError";
import type { GassmaConfig } from "./defineConfig";

const CONFIG_FILE_NAME = "gassma.config.ts";

type LoadedConfig = {
  config: GassmaConfig;
  filePath: string;
};

const loadConfig = (configPath?: string): LoadedConfig | undefined => {
  const filePath = path.resolve(process.cwd(), configPath ?? CONFIG_FILE_NAME);

  if (!fs.existsSync(filePath)) {
    if (configPath === undefined) return undefined;
    throw new ConfigFileNotFoundError(filePath);
  }

  const jiti = createJiti(filePath);
  const mod = jiti(filePath);
  const config: GassmaConfig = mod.default ?? mod;

  return { config, filePath };
};

export { loadConfig };
export type { LoadedConfig };
