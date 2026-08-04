import { describe, expect, it } from "vitest";
import { getModelNaming } from "../../../../generate/typeGenerate/tsdoc/modelNaming";
import { getUpdateDocLines } from "../../../../generate/typeGenerate/tsdoc/operations/updateDocs";

const BASE = "https://akahoshi1421.github.io/gassma-reference/en/docs";
const naming = getModelNaming("", "Post", ["title", "body"]);
const lines = getUpdateDocLines(naming);

describe("getUpdateDocLines", () => {
  it("should document update", () => {
    expect(lines.update).toEqual([
      "Update one Post.",
      `Read more here: ${BASE}/reference/crud/update/update`,
      "@param {GassmaPostUpdateSingleData} updateData - Arguments to update one Post.",
      "@example",
      "// Update one Post",
      "const post = gassma.Post.update({",
      "  where: {",
      "    // ... provide filter here",
      "  },",
      "  data: {",
      "    // ... provide data here",
      "  }",
      "})",
      "",
    ]);
  });

  it("should document updateMany", () => {
    expect(lines.updateMany).toEqual([
      "Update zero or more Posts.",
      "Note, that providing `undefined` is treated as the value not being there.",
      `Read more here: ${BASE}/reference/crud/update/updateMany`,
      "@param {GassmaPostUpdateData} updateData - Arguments to update one or more rows.",
      "@example",
      "// Update many Posts",
      "const { count } = gassma.Post.updateMany({",
      "  where: {",
      "    // ... provide filter here",
      "  },",
      "  data: {",
      "    // ... provide data here",
      "  }",
      "})",
      "",
    ]);
  });

  it("should document updateManyAndReturn", () => {
    expect(lines.updateManyAndReturn).toEqual([
      "Update zero or more Posts and returns the data updated in the spreadsheet.",
      "Note, that providing `undefined` is treated as the value not being there.",
      `Read more here: ${BASE}/reference/crud/update/updateManyAndReturn`,
      "@param {GassmaPostUpdateManyAndReturnData} updateData - Arguments to update many Posts.",
      "@example",
      "// Update many Posts",
      "const posts = gassma.Post.updateManyAndReturn({",
      "  where: {",
      "    // ... provide filter here",
      "  },",
      "  data: {",
      "    // ... provide data here",
      "  }",
      "})",
      "",
      "// Update zero or more Posts and only return the `title`",
      "const postWithTitleOnly = gassma.Post.updateManyAndReturn({",
      "  select: { title: true },",
      "  where: {",
      "    // ... provide filter here",
      "  },",
      "  data: {",
      "    // ... provide data here",
      "  }",
      "})",
      "",
    ]);
  });

  it("should document upsert", () => {
    expect(lines.upsert).toEqual([
      "Create or update one Post.",
      `Read more here: ${BASE}/reference/crud/update/upsert`,
      "@param {GassmaPostUpsertSingleData} upsertData - Arguments to update or create a Post.",
      "@example",
      "// Update or create a Post",
      "const post = gassma.Post.upsert({",
      "  create: {",
      "    // ... data to create a Post",
      "  },",
      "  update: {",
      "    // ... in case it already exists, update",
      "  },",
      "  where: {",
      "    // ... the filter for the Post we want to update",
      "  }",
      "})",
    ]);
  });
});
