import { describe, expect, it } from "vitest";
import { patchSchemaOutput } from "../../init/patchSchemaOutput";

const TEMPLATE = `generator client {
  provider = "prisma-client-js"
  output   = "./src/generated/gassma"
}
`;

describe("patchSchemaOutput", () => {
  it("should return the template verbatim when output is omitted", () => {
    expect(patchSchemaOutput(TEMPLATE, undefined)).toBe(TEMPLATE);
  });

  it("should replace the default output with a custom path", () => {
    const patched = patchSchemaOutput(TEMPLATE, "./custom/out");

    expect(patched).toBe(`generator client {
  provider = "prisma-client-js"
  output   = "./custom/out"
}
`);
  });

  it("should keep the rest of the template intact", () => {
    const withModel = `${TEMPLATE}
model User {
  id Int @id
}
`;
    const patched = patchSchemaOutput(withModel, "./db");

    expect(patched).toContain('output   = "./db"');
    expect(patched).toContain("model User");
    expect(patched).not.toContain("./src/generated/gassma");
  });

  it("should not treat replacement patterns in the path specially", () => {
    const patched = patchSchemaOutput(TEMPLATE, "./out/$&");

    expect(patched).toContain('output   = "./out/$&"');
  });
});
