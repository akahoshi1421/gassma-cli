import { generateTemplate } from "../../init/generateTemplate";

describe("generateTemplate", () => {
  it("should generate a basic schema template", () => {
    const result = generateTemplate({});

    expect(result).toContain("generator client");
    expect(result).toContain('provider = "prisma-client-js"');
    expect(result).toContain("output");
  });

  it("should use custom output path", () => {
    const result = generateTemplate({ output: "./src/generated/db" });

    expect(result).toContain('./src/generated/db"');
  });

  it("should use default output path when not specified", () => {
    const result = generateTemplate({});

    expect(result).toContain('./src/generated/gassma"');
  });

  it("should include User model with --with-model", () => {
    const result = generateTemplate({ withModel: true });

    expect(result).toContain("model User");
    expect(result).toContain("id");
    expect(result).toContain("@id");
    expect(result).toContain("email");
    expect(result).toContain("name");
  });

  it("should not include model without --with-model", () => {
    const result = generateTemplate({});

    expect(result).not.toContain("model User");
  });
});
