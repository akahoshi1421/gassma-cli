import { generateClientJs } from "../../../generate/jsGenerate/generateClientJs";

describe("generateClientJs", () => {
  it("should generate GassmaClient class with embedded relations", () => {
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

    const result = generateClientJs(relations, "Hoge");

    expect(result).toContain("hogeRelations =");
    expect(result).toContain('"User"');
    expect(result).toContain('"posts"');
    expect(result).toContain('"oneToMany"');
    expect(result).toContain('"Post"');
    expect(result).toContain('"author"');
    expect(result).toContain('"manyToOne"');
    expect(result).toContain("function GassmaClient");
    expect(result).toContain("exports.GassmaClient = GassmaClient");
  });

  it("should generate GassmaClient with empty relations when none exist", () => {
    const result = generateClientJs({}, "Hoge");

    expect(result).toContain("hogeRelations = {}");
    expect(result).toContain("function GassmaClient");
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

    const result = generateClientJs(relations, "Hoge");

    expect(result).toContain('"onDelete": "Cascade"');
    expect(result).toContain('"onUpdate": "SetNull"');
  });

  it("should include through property for manyToMany relations", () => {
    const relations = {
      Post: {
        tags: {
          type: "manyToMany" as const,
          to: "Tag",
          field: "id",
          reference: "id",
          through: {
            sheet: "_PostToTag",
            field: "postId",
            reference: "tagId",
          },
        },
      },
    };

    const result = generateClientJs(relations, "Hoge");

    expect(result).toContain('"through"');
    expect(result).toContain('"_PostToTag"');
    expect(result).toContain('"postId"');
    expect(result).toContain('"tagId"');
  });

  it("should merge relations into options in constructor", () => {
    const result = generateClientJs({}, "Fuga");

    expect(result).toContain("fugaRelations =");
    expect(result).toContain(
      "Object.assign({}, options, { relations: fugaRelations })",
    );
  });
});
