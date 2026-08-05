import { describe, expect, it } from "vitest";
import { getOneGassmaController } from "../../../../generate/typeGenerate/gassmaController/oneGassmaController";
import { getModelNaming } from "../../../../generate/typeGenerate/tsdoc/modelNaming";
import { getAutoincrementDocLines } from "../../../../generate/typeGenerate/tsdoc/operations/autoincrementDocs";

const BASE = "https://gassma.io/en/docs";
const LINK = `Read more here: ${BASE}/reference/config/autoincrement`;
const naming = getModelNaming("", "Post", ["id", "title"]);
const lines = getAutoincrementDocLines(naming, ["id"]);

describe("getAutoincrementDocLines", () => {
  it("should document $getAutoincrement", () => {
    expect(lines.getAutoincrement).toEqual([
      "Get the value the next `create` will issue for an autoincrement field of Post.",
      "Reading the counter is allowed inside `$transaction`.",
      "Throws `GassmaAutoincrementNotConfiguredError` when the field is not an autoincrement field.",
      LINK,
      "@param {string} field - An autoincrement field of Post.",
      "@example",
      "// The id the next Post will get",
      'const next = gassma.Post.$getAutoincrement("id")',
    ]);
  });

  it("should document $setAutoincrement", () => {
    expect(lines.setAutoincrement).toEqual([
      "Set the value the next `create` will issue for an autoincrement field of Post.",
      "`next` is the value that will be issued next, so it must be an integer of 1 or more.",
      "Throws `GassmaAutoincrementInTransactionError` inside `$transaction`, because the counter is never rolled back.",
      LINK,
      "@param {string} field - An autoincrement field of Post.",
      "@param {number} next - The value the next `create` will issue.",
      "@example",
      "// Let the next Post continue from 1000",
      'gassma.Post.$setAutoincrement("id", 1000)',
    ]);
  });

  it("should document $syncAutoincrement", () => {
    expect(lines.syncAutoincrement).toEqual([
      "Line the counter of Post up with the rows already in the sheet.",
      "The counter becomes the largest value in the column plus one, which is also the return value.",
      "Throws `GassmaAutoincrementInTransactionError` inside `$transaction`, because the counter is never rolled back.",
      LINK,
      "@param {string} field - An autoincrement field of Post.",
      "@example",
      "// Adopt a sheet that already has rows",
      'const next = gassma.Post.$syncAutoincrement("id")',
    ]);
  });

  it("should use the first autoincrement field in the examples, not the first column", () => {
    const multi = getAutoincrementDocLines(
      getModelNaming("", "Post", ["title", "seq"]),
      ["seq"],
    );

    expect(multi.getAutoincrement).toContain(
      'const next = gassma.Post.$getAutoincrement("seq")',
    );
  });

  it("should replace the example with a note when the model has no autoincrement field", () => {
    const none = getAutoincrementDocLines(naming, []);
    const note = "Post has no autoincrement field, so this cannot be called.";

    expect(none.getAutoincrement).toEqual([
      "Get the value the next `create` will issue for an autoincrement field of Post.",
      note,
      LINK,
    ]);
    expect(none.setAutoincrement).toEqual([
      "Set the value the next `create` will issue for an autoincrement field of Post.",
      note,
      LINK,
    ]);
    expect(none.syncAutoincrement).toEqual([
      "Line the counter of Post up with the rows already in the sheet.",
      note,
      LINK,
    ]);
  });
});

describe("generated autoincrement counter tsdoc", () => {
  const result = getOneGassmaController("", "Post", ["id", "title"], ["id"]);

  it.each([
    "$getAutoincrement(field:",
    "$setAutoincrement(field:",
    "$syncAutoincrement(field:",
  ])("should place a doc block right before %s", (member) => {
    expect(result).toContain(`   */\n  ${member}`);
  });

  it("should document the counter methods with the reference link", () => {
    expect(result).toContain(`   * ${LINK}\n`);
  });
});
