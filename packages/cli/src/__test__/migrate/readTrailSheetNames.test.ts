import { describe, expect, it } from "vitest";
import { readTrailSheetNames } from "../../migrate/readTrailSheetNames";

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

describe("readTrailSheetNames", () => {
  it("should read the sheet names from a recorded migration", () => {
    expect(readTrailSheetNames(trail)).toEqual(["User", "Memo"]);
  });

  it("should not confuse column names with sheet names", () => {
    expect(readTrailSheetNames(trail)).not.toContain("id");
  });

  it("should read the sheet names when the library uses a custom userSymbol", () => {
    const custom = trail.replace("Gassma.", "MyOwnGassma.");

    expect(readTrailSheetNames(custom)).toEqual(["User", "Memo"]);
  });

  it("should read the sheet names when the migration function was renamed", () => {
    const renamed = trail.replace("gassmaMigrate", "syncSheets");

    expect(readTrailSheetNames(renamed)).toEqual(["User", "Memo"]);
  });

  it("should read the sheet names regardless of formatting", () => {
    const minified =
      'function gassmaMigrate(){Gassma.migrateSheets({models:[{name:"User",columns:["id"]},{name:"Memo",columns:["id"]}]})}';

    expect(readTrailSheetNames(minified)).toEqual(["User", "Memo"]);
  });

  it("should read the sheet names when acceptDataLoss is recorded", () => {
    const withFlag = trail.replace(
      '    spreadsheetId: "abc123",',
      '    spreadsheetId: "abc123",\n    acceptDataLoss: true,',
    );

    expect(readTrailSheetNames(withFlag)).toEqual(["User", "Memo"]);
  });

  it("should return undefined when the content never calls migrateSheets", () => {
    expect(
      readTrailSheetNames("function gassmaMigrate() {}\n"),
    ).toBeUndefined();
  });

  it("should return undefined when the content cannot be parsed", () => {
    expect(readTrailSheetNames("function gassmaMigrate( {")).toBeUndefined();
  });

  it("should return undefined when the recorded models are not sheet definitions", () => {
    const broken = `function gassmaMigrate() {
  Gassma.migrateSheets({ models: "User" });
}
`;

    expect(readTrailSheetNames(broken)).toBeUndefined();
  });

  it("should not let the recorded script touch the host globals", () => {
    const hostile = `globalThis.__gassmaTrailLeak = true;
function gassmaMigrate() {
  Gassma.migrateSheets({ models: [{ name: "User", columns: [] }] });
}
`;

    expect(readTrailSheetNames(hostile)).toEqual(["User"]);
    expect("__gassmaTrailLeak" in globalThis).toBe(false);
  });

  it("should give up instead of hanging on an endless script", () => {
    const endless = `function gassmaMigrate() {
  while (true) {}
}
`;

    expect(readTrailSheetNames(endless)).toBeUndefined();
  });
});
