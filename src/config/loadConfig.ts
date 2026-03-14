import fs from "fs";
import path from "path";
import { createJiti } from "jiti";
import type { GassmaConfig } from "./defineConfig";

const CONFIG_FILE_NAME = "gassma.config.ts";

const loadConfig = (): GassmaConfig | undefined => {
  const configPath = path.resolve(process.cwd(), CONFIG_FILE_NAME);

  if (!fs.existsSync(configPath)) {
    return undefined;
  }

  const jiti = createJiti(configPath);
  const mod = jiti(configPath);
  const config = (mod.default ?? mod) as GassmaConfig;

  return config;
};

export { loadConfig };
