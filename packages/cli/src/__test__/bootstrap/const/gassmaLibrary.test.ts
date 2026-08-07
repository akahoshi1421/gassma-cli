import { describe, expect, it } from "vitest";
import { GASSMA_LIBRARY } from "../../../bootstrap/const/gassmaLibrary";

describe("GASSMA_LIBRARY", () => {
  it("should pin the library version this CLI is paired with", () => {
    expect(GASSMA_LIBRARY.version).toBe("9");
  });
});
