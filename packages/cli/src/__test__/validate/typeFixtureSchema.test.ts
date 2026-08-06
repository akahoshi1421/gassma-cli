import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { validateSchema } from "../../validate/validate";

const fixturePath = path.resolve(__dirname, "../types/fixtures/schema.prisma");

describe("type test fixture schema", () => {
  it("should pass the same validation as the generate/validate commands", () => {
    const result = validateSchema(fs.readFileSync(fixturePath, "utf-8"));

    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });
});
