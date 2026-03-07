import { generateClientJs } from "../../../generate/jsGenerate/generateClientJs";

describe("generateClientJs", () => {
  it("should generate JS with embedded relations config", () => {
    const relations = {
      User: {
        posts: {
          type: "oneToMany" as const,
          to: "Post",
          field: "id",
          reference: "authorId",
        },
      },
      Post: {
        author: {
          type: "manyToOne" as const,
          to: "User",
          field: "authorId",
          reference: "id",
        },
      },
    };

    const result = generateClientJs(relations);

    expect(result).toContain("const relations =");
    expect(result).toContain('"User"');
    expect(result).toContain('"posts"');
    expect(result).toContain('"oneToMany"');
    expect(result).toContain('"Post"');
    expect(result).toContain('"author"');
    expect(result).toContain('"manyToOne"');
    expect(result).toContain("function createGassmaClient");
  });

  it("should generate JS with empty relations when none exist", () => {
    const result = generateClientJs({});

    expect(result).toContain("const relations = {}");
    expect(result).toContain("function createGassmaClient");
  });

  it("should include onDelete and onUpdate when present", () => {
    const relations = {
      Post: {
        author: {
          type: "manyToOne" as const,
          to: "User",
          field: "authorId",
          reference: "id",
          onDelete: "Cascade",
          onUpdate: "SetNull",
        },
      },
    };

    const result = generateClientJs(relations);

    expect(result).toContain('"onDelete": "Cascade"');
    expect(result).toContain('"onUpdate": "SetNull"');
  });
});
