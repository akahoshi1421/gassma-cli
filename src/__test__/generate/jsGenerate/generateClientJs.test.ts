import { generateClientJs } from "../../../generate/jsGenerate/generateClientJs";
import type { DefaultsConfig } from "../../../generate/read/extractDefaults";
import type { UpdatedAtConfig } from "../../../generate/read/extractUpdatedAt";
import type { IgnoreConfig } from "../../../generate/read/extractIgnore";
import type { MapConfig } from "../../../generate/read/extractMap";

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
    expect(result).toContain("class GassmaClient");
    expect(result).toContain("exports.GassmaClient = GassmaClient");
  });

  it("should generate GassmaClient with empty relations when none exist", () => {
    const result = generateClientJs({}, "Hoge");

    expect(result).toContain("hogeRelations = {}");
    expect(result).toContain("class GassmaClient");
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

  it("should embed defaults with static values", () => {
    const defaults: DefaultsConfig = {
      User: { isActive: { kind: "static", value: true } },
      Post: { viewCount: { kind: "static", value: 0 } },
    };

    const result = generateClientJs({}, "Test", defaults);

    expect(result).toContain("testDefaults =");
    expect(result).toContain("defaults: testDefaults");
  });

  it("should embed now() as () => new Date()", () => {
    const defaults: DefaultsConfig = {
      User: { createdAt: { kind: "function", name: "now" } },
    };

    const result = generateClientJs({}, "Test", defaults);

    expect(result).toContain("() => new Date()");
  });

  it("should embed uuid() as () => Utilities.getUuid()", () => {
    const defaults: DefaultsConfig = {
      User: { id: { kind: "function", name: "uuid" } },
    };

    const result = generateClientJs({}, "Test", defaults);

    expect(result).toContain("() => Utilities.getUuid()");
  });

  it("should not embed defaults when config is empty", () => {
    const result = generateClientJs({}, "Test", {});

    expect(result).not.toContain("Defaults");
    expect(result).not.toContain("defaults");
  });

  it("should embed updatedAt config", () => {
    const updatedAt: UpdatedAtConfig = {
      User: ["updatedAt"],
      Post: ["updatedAt", "modifiedAt"],
    };

    const result = generateClientJs({}, "Test", undefined, updatedAt);

    expect(result).toContain("testUpdatedAt =");
    expect(result).toContain("updatedAt: testUpdatedAt");
    expect(result).toContain('"User"');
    expect(result).toContain('"updatedAt"');
    expect(result).toContain('"Post"');
    expect(result).toContain('"modifiedAt"');
  });

  it("should not embed updatedAt when config is empty", () => {
    const result = generateClientJs({}, "Test", undefined, {});

    expect(result).not.toContain("UpdatedAt");
    expect(result).not.toContain("updatedAt");
  });

  it("should embed both defaults and updatedAt", () => {
    const defaults: DefaultsConfig = {
      User: { isActive: { kind: "static", value: true } },
    };
    const updatedAt: UpdatedAtConfig = {
      User: ["updatedAt"],
    };

    const result = generateClientJs({}, "Test", defaults, updatedAt);

    expect(result).toContain("testDefaults");
    expect(result).toContain("testUpdatedAt");
    expect(result).toContain("defaults: testDefaults");
    expect(result).toContain("updatedAt: testUpdatedAt");
  });

  it("should embed ignore config", () => {
    const ignore: IgnoreConfig = {
      User: ["internal", "debugLog"],
      Post: ["tempData"],
    };

    const result = generateClientJs({}, "Test", undefined, undefined, ignore);

    expect(result).toContain("testIgnore =");
    expect(result).toContain("ignore: testIgnore");
    expect(result).toContain('"User"');
    expect(result).toContain('"internal"');
    expect(result).toContain('"debugLog"');
    expect(result).toContain('"Post"');
    expect(result).toContain('"tempData"');
  });

  it("should not embed ignore when config is empty", () => {
    const result = generateClientJs({}, "Test", undefined, undefined, {});

    expect(result).not.toContain("Ignore");
    expect(result).not.toContain("ignore");
  });

  it("should embed all configs together", () => {
    const defaults: DefaultsConfig = {
      User: { isActive: { kind: "static", value: true } },
    };
    const updatedAt: UpdatedAtConfig = {
      User: ["updatedAt"],
    };
    const ignore: IgnoreConfig = {
      User: ["internal"],
    };

    const result = generateClientJs({}, "Test", defaults, updatedAt, ignore);

    expect(result).toContain("defaults: testDefaults");
    expect(result).toContain("updatedAt: testUpdatedAt");
    expect(result).toContain("ignore: testIgnore");
  });

  it("should embed map config", () => {
    const map: MapConfig = {
      User: { firstName: "first_name", lastName: "last_name" },
      Post: { postTitle: "post_title" },
    };

    const result = generateClientJs(
      {},
      "Test",
      undefined,
      undefined,
      undefined,
      map,
    );

    expect(result).toContain("testMap =");
    expect(result).toContain("map: testMap");
    expect(result).toContain('"User"');
    expect(result).toContain('"firstName"');
    expect(result).toContain('"first_name"');
    expect(result).toContain('"Post"');
    expect(result).toContain('"postTitle"');
    expect(result).toContain('"post_title"');
  });

  it("should not embed map when config is empty", () => {
    const result = generateClientJs(
      {},
      "Test",
      undefined,
      undefined,
      undefined,
      {},
    );

    expect(result).not.toContain("Map");
    expect(result).not.toContain("map:");
  });
});
