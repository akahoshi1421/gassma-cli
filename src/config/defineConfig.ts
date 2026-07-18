type GassmaConfig = {
  schema?: string;
  datasource?: {
    url?: string;
  };
};

const defineConfig = (config: GassmaConfig): GassmaConfig => {
  return config;
};

export { defineConfig };
export { env } from "./env";
export { GassmaConfigEnvError } from "../error/mainError";
export type { GassmaConfig };
