import { defineConfig } from "../../config/defineConfig";

describe("defineConfig", () => {
  it("should return the config object as-is", () => {
    const config = defineConfig({ schema: "gassma/schema.prisma" });
    expect(config).toEqual({ schema: "gassma/schema.prisma" });
  });

  it("should work without schema", () => {
    const config = defineConfig({});
    expect(config).toEqual({});
  });
});
