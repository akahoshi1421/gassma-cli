import { describe, expect, it } from "vitest";
import { readTrailDefinition } from "../../migrate/readTrailDefinition";

const trail = `function gassmaMigrate() {
  Gassma.migrateSheets({
    spreadsheetId: "abc123",
    models: [
      { name: "User", columns: ["id", "name"] },
      { name: "Memo", columns: ["id"] }
    ]
  });
}
`;

describe("readTrailDefinition", () => {
  it("should read the sheets and their columns from a recorded migration", () => {
    expect(readTrailDefinition(trail)?.models).toEqual([
      { name: "User", columns: ["id", "name"] },
      { name: "Memo", columns: ["id"] },
    ]);
  });

  it("should report acceptDataLoss as false when it was not recorded", () => {
    expect(readTrailDefinition(trail)?.acceptDataLoss).toBe(false);
  });

  it("should report acceptDataLoss as true when it was recorded", () => {
    const withFlag = trail.replace(
      '    spreadsheetId: "abc123",',
      '    spreadsheetId: "abc123",\n    acceptDataLoss: true,',
    );

    expect(readTrailDefinition(withFlag)?.acceptDataLoss).toBe(true);
  });

  it("should read a migration written with a custom userSymbol", () => {
    const custom = trail.replace("Gassma.", "MyOwnGassma.");

    expect(readTrailDefinition(custom)?.models).toHaveLength(2);
  });

  it("should read a migration whose function was renamed", () => {
    const renamed = trail.replace("gassmaMigrate", "syncSheets");

    expect(readTrailDefinition(renamed)?.models).toHaveLength(2);
  });

  it("should read a migration regardless of formatting", () => {
    const minified =
      'function gassmaMigrate(){Gassma.migrateSheets({models:[{name:"User",columns:["id"]}]})}';

    expect(readTrailDefinition(minified)?.models).toEqual([
      { name: "User", columns: ["id"] },
    ]);
  });

  it("should return undefined when the content never calls migrateSheets", () => {
    expect(
      readTrailDefinition("function gassmaMigrate() {}\n"),
    ).toBeUndefined();
  });

  it("should return undefined when the content cannot be parsed", () => {
    expect(readTrailDefinition("function gassmaMigrate( {")).toBeUndefined();
  });

  it("should return undefined when the recorded models are not sheet definitions", () => {
    const broken = `function gassmaMigrate() {
  Gassma.migrateSheets({ models: "User" });
}
`;

    expect(readTrailDefinition(broken)).toBeUndefined();
  });

  it("should return undefined when a recorded sheet has no columns", () => {
    const broken = `function gassmaMigrate() {
  Gassma.migrateSheets({ models: [{ name: "User" }] });
}
`;

    expect(readTrailDefinition(broken)).toBeUndefined();
  });

  it("should not let the recorded script touch the host globals", () => {
    const hostile = `globalThis.__gassmaTrailLeak = true;
function gassmaMigrate() {
  Gassma.migrateSheets({ models: [{ name: "User", columns: [] }] });
}
`;

    expect(readTrailDefinition(hostile)?.models).toEqual([
      { name: "User", columns: [] },
    ]);
    expect("__gassmaTrailLeak" in globalThis).toBe(false);
  });

  it("should give up instead of hanging on an endless script", () => {
    const endless = `function gassmaMigrate() {
  while (true) {}
}
`;

    expect(readTrailDefinition(endless)).toBeUndefined();
  });
});
