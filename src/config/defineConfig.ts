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
export type { GassmaConfig };
