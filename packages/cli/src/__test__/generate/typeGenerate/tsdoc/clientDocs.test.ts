import { describe, expect, it } from "vitest";
import { generateClientDts } from "../../../../generate/jsGenerate/generateClientDts";

const BASE = "https://gassma.io/en/docs";
const BLANK = " * ";
const result = generateClientDts("Hoge", undefined, ["Post", "User"]);

const clientDoc = [
  "/**",
  " * ##  GASsma Client",
  BLANK,
  " * Type-safe Google Sheets client for TypeScript & Google Apps Script",
  " * @example",
  " * ```",
  " * const gassma = new GassmaClient()",
  " * // Fetch zero or more Posts",
  " * const posts = gassma.Post.findMany()",
  " * ```",
  BLANK,
  BLANK,
  ` * Read more in our [docs](${BASE}/reference/basic).`,
  " */",
].join("\n");

describe("generateClientDts tsdoc", () => {
  it("should document the transaction client type", () => {
    expect(result).toContain(
      [
        "/**",
        " * `GassmaClient` proxy available in interactive transactions.",
        " */",
        "export type GassmaHogeTransactionClient<",
      ].join("\n"),
    );
  });

  it("should document the client interface", () => {
    expect(result).toContain(`${clientDoc}\nexport interface GassmaClient<`);
  });

  it("should document the client class", () => {
    expect(result).toContain(
      `${clientDoc}\nexport declare class GassmaClient<`,
    );
  });

  it("should document the constructor", () => {
    expect(result).toContain(
      [
        "  /**",
        "   * Creates a GASsma client.",
        "   * @param {GassmaHogeClientOptions} options - Spreadsheet id and model configuration.",
        "   * @example",
        "   * ```",
        "   * const gassma = new GassmaClient()",
        "   * ```",
        "   * ",
        "   * ```",
        '   * const gassma = new GassmaClient({ id: "<spreadsheet id>" })',
        "   * ```",
        "   */",
        "  constructor(options?: GassmaHogeClientOptions<O>);",
      ].join("\n"),
    );
  });

  it("should document $transaction", () => {
    expect(result).toContain(
      [
        "  /**",
        "   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.",
        `   * Read more here: ${BASE}/reference/transaction`,
        "   * @example",
        "   * ```",
        "   * const [alice, bob] = gassma.$transaction((tx) => {",
        "   *   const alice = tx.Post.create({ data: { ... } })",
        "   *   const bob = tx.Post.create({ data: { ... } })",
        "   *   return [alice, bob]",
        "   * })",
        "   * ```",
        "   */",
        "  $transaction<T>(",
      ].join("\n"),
    );
  });

  it("should document $extends on both the transaction client and the client interface", () => {
    const extendsDoc = [
      "  /**",
      "   * Creates an extended client with additional behaviour.",
      `   * Read more here: ${BASE}/reference/client-extensions/result`,
      "   * @example",
      "   * ```",
      "   * const extended = gassma.$extends({",
      "   *   result: {",
      "   *     // ... provide result extensions here",
      "   *   }",
      "   * })",
      "   * ```",
      "   */",
      "  $extends: GassmaHogeExtendsFn<O, {}>;",
    ].join("\n");

    expect(result.split(extendsDoc)).toHaveLength(3);
  });

  it("should link $transaction and $extends to their reference pages", () => {
    expect(result).toContain(`${BASE}/reference/transaction`);
    expect(result).toContain(`${BASE}/reference/client-extensions/result`);
  });
});
