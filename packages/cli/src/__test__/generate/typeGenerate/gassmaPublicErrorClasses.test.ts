import { describe, expect, it } from "vitest";
import { getGassmaErrorClasses } from "../../../generate/typeGenerate/gassmaErrorClasses";
import { gassmaPublicErrorClasses } from "./fixtures/gassmaPublicErrorClasses";

const declaredErrorClasses = (): string[] => {
  const matches = getGassmaErrorClasses().matchAll(
    /^ {2}class ([A-Za-z]+) extends/gm,
  );
  return [...matches].map((match) => match[1]).sort();
};

describe("generated Gassma namespace error classes", () => {
  it("should declare every error class gassma exports", () => {
    const missing = gassmaPublicErrorClasses.filter(
      (name) => !declaredErrorClasses().includes(name),
    );

    expect(missing).toEqual([]);
  });

  it("should not declare error classes gassma does not export", () => {
    const extra = declaredErrorClasses().filter(
      (name) => !gassmaPublicErrorClasses.includes(name),
    );

    expect(extra).toEqual([]);
  });

  it("should match gassma exactly", () => {
    expect(declaredErrorClasses()).toEqual(
      [...gassmaPublicErrorClasses].sort(),
    );
  });
});
