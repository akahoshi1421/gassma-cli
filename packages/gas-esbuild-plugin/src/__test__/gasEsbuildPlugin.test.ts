import fs from "fs";
import os from "os";
import path from "path";
import vm from "vm";
import { build } from "esbuild";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { gasEsbuildPlugin } from "../gasEsbuildPlugin";

const GLOBAL_NAME = "__gassmaExports";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-gas-plugin-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

const writeSource = (fileName: string, code: string): string => {
  const filePath = path.join(tmpDir, fileName);
  fs.writeFileSync(filePath, code);
  return filePath;
};

const buildWithPlugin = async (entry: string): Promise<string> => {
  const outfile = path.join(tmpDir, "out.js");
  await build({
    entryPoints: [entry],
    bundle: true,
    outfile,
    logLevel: "silent",
    plugins: [gasEsbuildPlugin()],
  });
  return fs.readFileSync(outfile, "utf8");
};

// Runs the bundle the same way GAS does: load the whole script into a global
// scope first, then call top-level functions by name.
const runAsGasScript = (code: string): vm.Context => {
  const context = vm.createContext({});
  vm.runInContext(code, context);
  return context;
};

describe("gasEsbuildPlugin", () => {
  it("should expose exported function declarations as callable top-level functions", async () => {
    const entry = writeSource(
      "main.ts",
      "export function hello(): string { return 'hello GAS'; }\n" +
        "export function add(a: number, b: number): number { return a + b; }\n",
    );

    const output = await buildWithPlugin(entry);

    expect(output).toContain(
      `function hello() { return ${GLOBAL_NAME}.hello.apply(this, arguments); }`,
    );
    expect(output).toContain(
      `function add() { return ${GLOBAL_NAME}.add.apply(this, arguments); }`,
    );

    const context = runAsGasScript(output);
    expect(vm.runInContext("typeof hello", context)).toBe("function");
    expect(vm.runInContext("typeof add", context)).toBe("function");
    expect(vm.runInContext("hello()", context)).toBe("hello GAS");
    expect(vm.runInContext("add(2, 3)", context)).toBe(5);
  });

  it("should expose exported arrow functions as callable top-level functions", async () => {
    const entry = writeSource(
      "main.ts",
      "export const greet = (name: string): string => 'hi, ' + name;\n",
    );

    const output = await buildWithPlugin(entry);

    expect(output).toContain(
      `function greet() { return ${GLOBAL_NAME}.greet.apply(this, arguments); }`,
    );

    const context = runAsGasScript(output);
    expect(vm.runInContext("typeof greet", context)).toBe("function");
    expect(vm.runInContext("greet('gas')", context)).toBe("hi, gas");
  });

  it("should prepend stubs before the bundled body", async () => {
    const entry = writeSource(
      "main.ts",
      "export function hello(): string { return 'hello'; }\n",
    );

    const output = await buildWithPlugin(entry);

    const stubIndex = output.indexOf("function hello()");
    const bundleIndex = output.indexOf(`var ${GLOBAL_NAME}`);
    expect(stubIndex).toBeGreaterThanOrEqual(0);
    expect(bundleIndex).toBeGreaterThan(stubIndex);
  });

  it("should share module state between stub calls", async () => {
    const entry = writeSource(
      "main.ts",
      "let count = 0;\n" +
        "export function increment(): number { count += 1; return count; }\n" +
        "export function current(): number { return count; }\n",
    );

    const output = await buildWithPlugin(entry);
    const context = runAsGasScript(output);

    expect(
      vm.runInContext("increment(); increment(); current()", context),
    ).toBe(2);
  });

  it("should not generate a stub for the default export", async () => {
    const entry = writeSource(
      "main.ts",
      "export default function main(): string { return 'default'; }\n" +
        "export function named(): string { return 'named'; }\n",
    );

    const output = await buildWithPlugin(entry);

    expect(output).not.toContain(`${GLOBAL_NAME}.default.apply`);
    expect(output).toContain(
      `function named() { return ${GLOBAL_NAME}.named.apply(this, arguments); }`,
    );

    const context = runAsGasScript(output);
    expect(vm.runInContext("named()", context)).toBe("named");
  });

  it("should leave the bundle without stubs when only a default export exists", async () => {
    const entry = writeSource(
      "main.ts",
      "export default function main(): string { return 'default only'; }\n",
    );

    const output = await buildWithPlugin(entry);

    expect(output).not.toContain(".apply(this, arguments)");
    expect(() => runAsGasScript(output)).not.toThrow();
  });

  it("should resolve re-exports from other modules", async () => {
    writeSource(
      "lib.ts",
      "export function libFunc(): string { return 'lib'; }\n",
    );
    writeSource("util.ts", "export const utilFunc = (): string => 'util';\n");
    const entry = writeSource(
      "main.ts",
      "export * from './lib';\nexport { utilFunc } from './util';\n",
    );

    const output = await buildWithPlugin(entry);

    expect(output).toContain(
      `function libFunc() { return ${GLOBAL_NAME}.libFunc.apply(this, arguments); }`,
    );
    expect(output).toContain(
      `function utilFunc() { return ${GLOBAL_NAME}.utilFunc.apply(this, arguments); }`,
    );

    const context = runAsGasScript(output);
    expect(vm.runInContext("libFunc()", context)).toBe("lib");
    expect(vm.runInContext("utilFunc()", context)).toBe("util");
  });

  it("should force iife output even when another format is requested", async () => {
    const entry = writeSource(
      "main.ts",
      "export function hello(): string { return 'hello'; }\n",
    );
    const outfile = path.join(tmpDir, "out.js");

    await build({
      entryPoints: [entry],
      bundle: true,
      outfile,
      format: "esm",
      logLevel: "silent",
      plugins: [gasEsbuildPlugin()],
    });

    const output = fs.readFileSync(outfile, "utf8");
    expect(output).toContain(`var ${GLOBAL_NAME}`);

    // An esm bundle would throw a SyntaxError inside vm.runInContext.
    const context = runAsGasScript(output);
    expect(vm.runInContext("hello()", context)).toBe("hello");
  });

  it("should throw a clear error when outfile is not specified", async () => {
    const entry = writeSource(
      "main.ts",
      "export function hello(): string { return 'hello'; }\n",
    );

    await expect(
      build({
        entryPoints: [entry],
        bundle: true,
        logLevel: "silent",
        plugins: [gasEsbuildPlugin()],
      }),
    ).rejects.toThrow(/outfile/);
  });

  it("should throw a clear error when write is disabled", async () => {
    const entry = writeSource(
      "main.ts",
      "export function hello(): string { return 'hello'; }\n",
    );

    await expect(
      build({
        entryPoints: [entry],
        bundle: true,
        outfile: path.join(tmpDir, "out.js"),
        write: false,
        logLevel: "silent",
        plugins: [gasEsbuildPlugin()],
      }),
    ).rejects.toThrow(/write: false/);
  });
});
