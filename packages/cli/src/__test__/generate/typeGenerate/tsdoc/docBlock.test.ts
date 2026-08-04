import { describe, expect, it } from "vitest";
import {
  REFERENCE_BASE_URL,
  renderDocBlock,
} from "../../../../generate/typeGenerate/tsdoc/docBlock";

describe("renderDocBlock", () => {
  it("should wrap lines in a jsdoc block ending with a newline", () => {
    expect(renderDocBlock("", ["Hello", "World"])).toBe(
      "/**\n * Hello\n * World\n */\n",
    );
  });

  it("should prefix every line with the given indent", () => {
    expect(renderDocBlock("  ", ["Hello"])).toBe("  /**\n   * Hello\n   */\n");
  });

  it("should render an empty line as a star followed by a single space", () => {
    expect(renderDocBlock("", ["a", "", "b"])).toBe(
      "/**\n * a\n * \n * b\n */\n",
    );
  });

  it("should render an indented empty line with the indent kept", () => {
    expect(renderDocBlock("  ", [""])).toBe("  /**\n   * \n   */\n");
  });

  it("should expose the reference site base url", () => {
    expect(REFERENCE_BASE_URL).toBe(
      "https://akahoshi1421.github.io/gassma-reference/en/docs",
    );
  });
});
