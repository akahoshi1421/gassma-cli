import { describe, expect, it } from "vitest";
import { stripIgnoreAttributes } from "../../migrate/stripIgnoreAttributes";

describe("stripIgnoreAttributes", () => {
  it("should remove @ignore field attributes", () => {
    const schema = `
model User {
  id       Int    @id
  internal String @ignore
}
`;
    const result = stripIgnoreAttributes(schema);
    expect(result).not.toContain("@ignore");
    expect(result).toContain("internal String");
  });

  it("should remove @@ignore block attributes without leaving a stray @", () => {
    const schema = `
model AuditLog {
  id Int @id

  @@ignore
}
`;
    const result = stripIgnoreAttributes(schema);
    expect(result).not.toContain("ignore");
    expect(result).not.toMatch(/^\s*@\s*$/m);
  });

  it("should keep other attributes untouched", () => {
    const schema = `
model User {
  id   Int    @id @default(autoincrement())
  name String @map("user_name") @ignore

  @@map("users")
}
`;
    const result = stripIgnoreAttributes(schema);
    expect(result).toContain("@id");
    expect(result).toContain("@default(autoincrement())");
    expect(result).toContain('@map("user_name")');
    expect(result).toContain('@@map("users")');
  });

  it("should not touch fields whose name contains ignore", () => {
    const schema = `
model Flag {
  id          Int     @id
  ignoreCount Int
  ignored     Boolean
}
`;
    const result = stripIgnoreAttributes(schema);
    expect(result).toContain("ignoreCount");
    expect(result).toContain("ignored");
  });
});
