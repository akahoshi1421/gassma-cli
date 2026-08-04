import { describe, expect, it } from "vitest";
import { generater } from "../../../../generate/generator";
import { generateClientDts } from "../../../../generate/jsGenerate/generateClientDts";

const dictYaml = {
  Post: { id: ["number"], title: ["string"] },
  Users: { id: ["number"], name: ["string"] },
};
const generated = `${generater(dictYaml, undefined, "", true)}\n${generateClientDts("", undefined, Object.keys(dictYaml))}`;

const ARGUMENT_LESS_OPERATIONS = [
  "count",
  "deleteMany",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
];

const getDocumentedNoArgCalls = () => {
  const docLines = generated.split("\n").filter((line) => /^\s*\*/.test(line));
  const calls = docLines.flatMap(
    (line) => line.match(/\.[A-Za-z_$][A-Za-z0-9_$]*\(\)/g) ?? [],
  );

  return [...new Set(calls.map((call) => call.slice(1, -2)))].sort();
};

describe("generated tsdoc", () => {
  it("should never emit await because gassma is synchronous", () => {
    expect(generated).not.toContain("await");
  });

  it("should never mention the prisma client or its short links", () => {
    expect(generated).not.toContain("pris.ly");
    expect(generated).not.toContain("prisma.");
  });

  it("should link the client-level features to their reference pages", () => {
    expect(generated).toContain("/reference/transaction");
    expect(generated).toContain("/reference/client-extensions/result");
  });

  it("should link Gassma.skip to strictUndefinedChecks when it is declared", () => {
    const strictGenerated = generater(
      dictYaml,
      undefined,
      "",
      true,
      undefined,
      undefined,
      undefined,
      undefined,
      true,
    );

    expect(strictGenerated).toContain(
      "/reference/config/strict-undefined-checks",
    );
  });

  it("should link to the english reference, matching the language of the docs", () => {
    const links = generated.match(/https:\/\/[^\s)]+gassma-reference[^\s)]*/g);

    expect(links).not.toBeNull();
    links?.forEach((link) => {
      expect(link).toContain("/gassma-reference/en/docs/");
    });
  });

  it("should not document findUnique operations that gassma does not have", () => {
    expect(generated).not.toContain("findUnique");
  });

  it("should never close a doc block from inside a doc line", () => {
    const contentLines = generated
      .split("\n")
      .filter((line) => /^\s*\* /.test(line));

    expect(contentLines.filter((line) => line.includes("*/"))).toEqual([]);
  });

  it("should document every model", () => {
    expect(generated).toContain(
      " * The delegate class that exposes CRUD operations for the **Post** model.",
    );
    expect(generated).toContain(
      " * The delegate class that exposes CRUD operations for the **Users** model.",
    );
  });

  it("should only show argument-less calls for the operations that allow them", () => {
    expect(getDocumentedNoArgCalls()).toEqual(ARGUMENT_LESS_OPERATIONS);
  });

  it("should warn that deleteMany without arguments deletes everything", () => {
    expect(generated).toContain(
      "   * Calling `deleteMany` without arguments deletes **all** rows in the sheet. This cannot be undone.",
    );
  });

  it("should not pluralize a model name that already ends with s", () => {
    expect(generated).toContain("   * // Get all Users");
    expect(generated).toContain("   * const users = gassma.Users.findMany()");
  });
});
