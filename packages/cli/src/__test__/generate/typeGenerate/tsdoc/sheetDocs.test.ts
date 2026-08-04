import { describe, expect, it } from "vitest";
import { getGassmaSheet } from "../../../../generate/typeGenerate/gassmaSheet";

describe("getGassmaSheet tsdoc", () => {
  it("should document each model property", () => {
    const result = getGassmaSheet(["Post"], "");

    expect(result).toContain(
      `  /**
   * \`gassma.Post\`: Exposes CRUD operations for the **Post** model.
   * Example usage:
   * \`\`\`ts
   * // Fetch zero or more Posts
   * const posts = gassma.Post.findMany()
   * \`\`\`
   */
  "Post": GassmaPostController<`,
    );
  });

  it("should use the bracket accessor for model names that are not identifiers", () => {
    const result = getGassmaSheet(["my-sheet"], "");

    expect(result).toContain(
      '   * `gassma["my-sheet"]`: Exposes CRUD operations for the **my-sheet** model.',
    );
    expect(result).toContain(
      '   * const mysheets = gassma["my-sheet"].findMany()',
    );
  });
});
