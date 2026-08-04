import { describe, expect, it } from "vitest";
import { getModelNaming } from "../../../../generate/typeGenerate/tsdoc/modelNaming";

describe("getModelNaming", () => {
  it("should pluralize a model name that does not end with s", () => {
    const naming = getModelNaming("", "Post", ["id", "title"]);

    expect(naming.model).toBe("Post");
    expect(naming.clean).toBe("Post");
    expect(naming.plural).toBe("Posts");
    expect(naming.variable).toBe("post");
    expect(naming.variablePlural).toBe("posts");
  });

  it("should keep a model name that is already plural", () => {
    const naming = getModelNaming("", "Users", ["id"]);

    expect(naming.plural).toBe("Users");
    expect(naming.variable).toBe("users");
    expect(naming.variablePlural).toBe("users");
  });

  it("should pluralize irregular model names", () => {
    expect(getModelNaming("", "Person", ["id"]).plural).toBe("People");
    expect(getModelNaming("", "Category", ["id"]).plural).toBe("Categories");
    expect(getModelNaming("", "Status", ["id"]).plural).toBe("Statuses");
  });

  it("should pluralize only the last word of a compound model name", () => {
    const naming = getModelNaming("", "OrderItem", ["id"]);

    expect(naming.plural).toBe("OrderItems");
    expect(naming.variablePlural).toBe("orderItems");
  });

  it("should keep an uncountable model name unchanged", () => {
    expect(getModelNaming("", "NewS", ["id"]).plural).toBe("NewS");
  });

  it("should build a dotted accessor for identifier-safe model names", () => {
    expect(getModelNaming("", "Post", ["id"]).accessor).toBe("gassma.Post");
    expect(getModelNaming("", "_Post$1", ["id"]).accessor).toBe(
      "gassma._Post$1",
    );
  });

  it("should build a bracket accessor for model names that are not identifiers", () => {
    expect(getModelNaming("", "My Sheet", ["id"]).accessor).toBe(
      'gassma["My Sheet"]',
    );
    expect(getModelNaming("", "1st", ["id"]).accessor).toBe('gassma["1st"]');
  });

  it("should build the generated type prefix from the schema name and the cleaned model name", () => {
    const naming = getModelNaming("Hoge", "My Sheet", ["id"]);

    expect(naming.clean).toBe("MySheet");
    expect(naming.prefix).toBe("GassmaHogeMySheet");
    expect(naming.variable).toBe("mySheet");
    expect(naming.variablePlural).toBe("mySheets");
  });

  it("should use the first column as the sample field", () => {
    const naming = getModelNaming("", "Post", ["title", "body"]);

    expect(naming.field).toBe("title");
    expect(naming.fieldCapital).toBe("Title");
  });

  it("should strip the optional marker from the first column", () => {
    const naming = getModelNaming("", "Post", ["title?", "body"]);

    expect(naming.field).toBe("title");
  });

  it("should fall back to id when the model has no column", () => {
    const naming = getModelNaming("", "Post", []);

    expect(naming.field).toBe("id");
    expect(naming.fieldCapital).toBe("Id");
  });
});
