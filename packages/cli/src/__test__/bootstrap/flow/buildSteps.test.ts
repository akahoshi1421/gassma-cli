import { describe, expect, it } from "vitest";
import { buildBootstrapSteps } from "../../../bootstrap/flow/buildSteps";

const stepIds = () => buildBootstrapSteps().map((step) => step.id);

describe("buildBootstrapSteps", () => {
  it("should ask for the linter between the style and the sample", () => {
    const ids = stepIds();

    expect(ids.indexOf("linter")).toBe(ids.indexOf("style") + 1);
    expect(ids.indexOf("sample")).toBe(ids.indexOf("linter") + 1);
  });

  it("should ask every question before writing project files", () => {
    const ids = stepIds();

    expect(ids.indexOf("linter")).toBeLessThan(ids.indexOf("projectFiles"));
  });
});
