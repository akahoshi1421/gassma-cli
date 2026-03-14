import { generateConfigTemplate } from "../../init/generateConfigTemplate";

describe("generateConfigTemplate", () => {
  it("should generate config with default schema path", () => {
    const result = generateConfigTemplate({});
    expect(result).toContain('import { defineConfig } from "gassma/config"');
    expect(result).toContain('schema: "gassma/schema.prisma"');
    expect(result).toContain("export default defineConfig");
  });

  it("should use custom schema path", () => {
    const result = generateConfigTemplate({
      schemaPath: "custom/my.prisma",
    });
    expect(result).toContain('schema: "custom/my.prisma"');
  });
});
