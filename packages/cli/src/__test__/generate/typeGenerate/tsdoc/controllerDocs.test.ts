import { describe, expect, it } from "vitest";
import { getOneGassmaController } from "../../../../generate/typeGenerate/gassmaController/oneGassmaController";

const BASE = "https://akahoshi1421.github.io/gassma-reference/en/docs";

describe("getOneGassmaController tsdoc", () => {
  const result = getOneGassmaController("", "Post", ["id", "title"]);

  it("should document the controller class", () => {
    expect(result).toContain(
      `/**
 * The delegate class that exposes CRUD operations for the **Post** model.
 */
export declare class GassmaPostController<`,
    );
  });

  it("should document the fields property", () => {
    expect(result).toContain(
      `  /**
   * Fields of the Post model
   */
  readonly fields: Record<string, Gassma.FieldRef>;`,
    );
  });

  it("should document changeSettings", () => {
    expect(result).toContain(
      `  /**
   * Change the range this model reads and writes on the spreadsheet.
   * Read more here: ${BASE}/reference/settings/changeSettings
   * @param {number} startRowNumber - The row number the header row lives on.
   * @param {number | string} startColumnValue - The first column of the range.
   * @param {number | string} endColumnValue - The last column of the range.
   */
  changeSettings(`,
    );
  });

  const members = [
    "createMany(createdData:",
    "createManyAndReturn<",
    "create<",
    "findFirst<",
    "findFirst():",
    "findFirstOrThrow<",
    "findFirstOrThrow():",
    "findMany<",
    "findMany():",
    "update<",
    "updateMany(updateData:",
    "updateManyAndReturn<",
    "upsert<",
    "delete<",
    "deleteMany(deleteData:",
    "deleteMany():",
    "aggregate<",
    "count<",
    "count():",
    "groupBy<",
  ];

  it.each(members)("should place a doc block right before %s", (member) => {
    expect(result).toContain(`   */\n  ${member}`);
  });

  it("should give every documented operation an example", () => {
    expect(result.split("   * @example\n")).toHaveLength(members.length + 1);
  });

  it("should use the model accessor and the first column in the examples", () => {
    expect(result).toContain("   * const posts = gassma.Post.findMany()");
    expect(result).toContain("   *   by: ['id'],");
  });

  it("should use the bracket accessor for model names that are not identifiers", () => {
    const bracketed = getOneGassmaController("", "My Sheet", ["name"]);

    expect(bracketed).toContain(
      '   * const mySheets = gassma["My Sheet"].findMany()',
    );
    expect(bracketed).toContain(
      "   * @param {GassmaMySheetFindManyData} findData - Arguments to filter and select certain fields only.",
    );
  });
});
