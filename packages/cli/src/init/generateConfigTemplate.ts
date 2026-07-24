type ConfigTemplateOptions = {
  schemaPath?: string;
};

const generateConfigTemplate = (options: ConfigTemplateOptions): string => {
  const schemaPath = options.schemaPath ?? "gassma/schema.prisma";

  return `import { defineConfig } from "gassma/config";

export default defineConfig({
  schema: "${schemaPath}",
  datasource: {
    url: "",
  },
});
`;
};

export { generateConfigTemplate };
export type { ConfigTemplateOptions };
