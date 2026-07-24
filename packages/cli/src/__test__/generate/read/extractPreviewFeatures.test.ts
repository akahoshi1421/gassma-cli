import { describe, it, expect } from "vitest";
import { extractPreviewFeatures } from "../../../generate/read/extractPreviewFeatures";

describe("extractPreviewFeatures", () => {
  it("should extract previewFeatures from generator block", () => {
    const schema = `
generator client {
  provider        = "prisma-client-js"
  output          = "./generated/gassma"
  previewFeatures = ["strictUndefinedChecks"]
}

model User {
  id   Int    @id
  name String
}
`;
    expect(extractPreviewFeatures(schema)).toEqual(["strictUndefinedChecks"]);
  });

  it("should extract multiple preview features", () => {
    const schema = `
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["strictUndefinedChecks", "someFutureFeature"]
}

model User {
  id Int @id
}
`;
    expect(extractPreviewFeatures(schema)).toEqual([
      "strictUndefinedChecks",
      "someFutureFeature",
    ]);
  });

  it("should return empty array when previewFeatures is absent", () => {
    const schema = `
generator client {
  provider = "prisma-client-js"
  output   = "./generated/gassma"
}

model User {
  id Int @id
}
`;
    expect(extractPreviewFeatures(schema)).toEqual([]);
  });

  it("should return empty array when no generator block exists", () => {
    const schema = `
model User {
  id Int @id
}
`;
    expect(extractPreviewFeatures(schema)).toEqual([]);
  });

  it("should return empty array for empty previewFeatures array", () => {
    const schema = `
generator client {
  provider        = "prisma-client-js"
  previewFeatures = []
}

model User {
  id Int @id
}
`;
    expect(extractPreviewFeatures(schema)).toEqual([]);
  });

  it("should ignore non-string items", () => {
    const schema = `
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["strictUndefinedChecks", 1]
}

model User {
  id Int @id
}
`;
    expect(extractPreviewFeatures(schema)).toEqual(["strictUndefinedChecks"]);
  });
});
