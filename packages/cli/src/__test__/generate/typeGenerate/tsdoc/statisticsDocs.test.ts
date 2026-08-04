import { describe, expect, it } from "vitest";
import { getModelNaming } from "../../../../generate/typeGenerate/tsdoc/modelNaming";
import { getStatisticsDocLines } from "../../../../generate/typeGenerate/tsdoc/operations/statisticsDocs";

const BASE = "https://gassma.io/en/docs";
const naming = getModelNaming("", "Post", ["title", "body"]);
const lines = getStatisticsDocLines(naming);

describe("getStatisticsDocLines", () => {
  it("should document aggregate", () => {
    expect(lines.aggregate).toEqual([
      "Allows you to perform aggregations operations on a Post.",
      "Note, that providing `undefined` is treated as the value not being there.",
      `Read more here: ${BASE}/reference/statistics/aggregate`,
      "@param {GassmaPostAggregateData} aggregateData - Select which aggregations you would like to apply and on what fields.",
      "@example",
      "// Count the Posts that match the filter",
      "const aggregations = gassma.Post.aggregate({",
      "  _count: true,",
      "  where: {",
      "    // ... provide filter here",
      "  },",
      "  take: 10,",
      "})",
    ]);
  });

  it("should document count with arguments", () => {
    expect(lines.count).toEqual([
      "Count the number of Posts.",
      "Note, that providing `undefined` is treated as the value not being there.",
      `Read more here: ${BASE}/reference/statistics/count`,
      "@param {GassmaPostCountData} countData - Arguments to filter Posts to count.",
      "@example",
      "// Count the number of Posts",
      "const count = gassma.Post.count({",
      "  where: {",
      "    // ... the filter for the Posts we want to count",
      "  }",
      "})",
    ]);
  });

  it("should document count without arguments", () => {
    expect(lines.countNoArgs).toEqual([
      "Count every Post.",
      `Read more here: ${BASE}/reference/statistics/count`,
      "@example",
      "// Count every Post",
      "const count = gassma.Post.count()",
    ]);
  });

  it("should document groupBy", () => {
    expect(lines.groupBy).toEqual([
      "Group by Post.",
      "Note, that providing `undefined` is treated as the value not being there.",
      `Read more here: ${BASE}/reference/statistics/groupBy`,
      "@param {GassmaPostGroupByData} groupByData - Group by arguments.",
      "@example",
      "// Group by title, get count",
      "const result = gassma.Post.groupBy({",
      "  by: ['title'],",
      "  _count: true,",
      "})",
      "",
    ]);
  });
});
