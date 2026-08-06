import { describe, expect, it } from "vitest";
import { findDrops } from "../../migrate/findDrops";

const recorded = {
  acceptDataLoss: false,
  models: [
    { name: "User", columns: ["id", "name", "age"] },
    { name: "Memo", columns: ["id", "body"] },
  ],
};

describe("findDrops", () => {
  it("should find nothing when the schema still defines everything", () => {
    expect(findDrops(recorded, recorded.models)).toEqual([]);
  });

  it("should find nothing when the schema only adds sheets and columns", () => {
    const models = [
      { name: "User", columns: ["id", "name", "age", "email"] },
      { name: "Memo", columns: ["id", "body"] },
      { name: "Post", columns: ["id"] },
    ];

    expect(findDrops(recorded, models)).toEqual([]);
  });

  it("should find a sheet that the schema no longer defines", () => {
    const models = [{ name: "User", columns: ["id", "name", "age"] }];

    expect(findDrops(recorded, models)).toEqual([
      { kind: "sheet", sheet: "Memo" },
    ]);
  });

  it("should find a column that the schema no longer defines", () => {
    const models = [
      { name: "User", columns: ["id", "name"] },
      { name: "Memo", columns: ["id", "body"] },
    ];

    expect(findDrops(recorded, models)).toEqual([
      { kind: "column", sheet: "User", column: "age" },
    ]);
  });

  it("should not report the columns of a dropped sheet twice", () => {
    const models = [{ name: "User", columns: ["id", "name", "age"] }];

    expect(findDrops(recorded, models)).toHaveLength(1);
  });

  it("should keep the recorded order when sheets and columns are dropped", () => {
    const models = [{ name: "User", columns: ["id"] }];

    expect(findDrops(recorded, models)).toEqual([
      { kind: "column", sheet: "User", column: "name" },
      { kind: "column", sheet: "User", column: "age" },
      { kind: "sheet", sheet: "Memo" },
    ]);
  });

  it("should find nothing when the schema renamed nothing but reordered columns", () => {
    const models = [
      { name: "Memo", columns: ["body", "id"] },
      { name: "User", columns: ["age", "name", "id"] },
    ];

    expect(findDrops(recorded, models)).toEqual([]);
  });
});
