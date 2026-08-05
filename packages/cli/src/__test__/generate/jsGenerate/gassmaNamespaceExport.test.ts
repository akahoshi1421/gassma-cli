import fs from "fs";
import { createRequire } from "module";
import os from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
import { generateClientJs } from "../../../generate/jsGenerate/generateClientJs";

const requireFromHere = createRequire(import.meta.url);

const fakeNamespace = () => ({
  GassmaClient: class FakeCoreClient {},
  NotFoundError: class NotFoundError extends Error {},
});

const writeGeneratedModule = (code: string) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-client-js-"));
  const filePath = path.join(dir, "schemaClient.js");
  fs.writeFileSync(filePath, code);
  return { dir, filePath };
};

describe("generated schemaClient.js Gassma namespace", () => {
  afterEach(() => {
    Reflect.deleteProperty(globalThis, "Gassma");
  });

  it("should re-export the Gassma namespace the .d.ts declares", () => {
    const code = generateClientJs({}, "Hoge");
    const exportsObject: Record<string, unknown> = {};
    const namespace = fakeNamespace();

    const run = new Function("Gassma", "exports", "LockService", code);
    run(namespace, exportsObject, { getScriptLock: () => ({}) });

    expect(exportsObject.Gassma).toBe(namespace);
  });

  it("should let the re-exported namespace be used with instanceof", () => {
    const code = generateClientJs({}, "Hoge");
    const exportsObject: {
      Gassma?: { NotFoundError: new () => Error };
    } = {};
    const namespace = fakeNamespace();

    const run = new Function("Gassma", "exports", "LockService", code);
    run(namespace, exportsObject, { getScriptLock: () => ({}) });

    const NotFoundError = exportsObject.Gassma?.NotFoundError;
    if (!NotFoundError) throw new Error("Gassma.NotFoundError not exported");
    expect(new NotFoundError() instanceof NotFoundError).toBe(true);
    expect(new Error("other") instanceof NotFoundError).toBe(false);
  });

  it("should not read the Gassma global while the module is evaluated", () => {
    const code = generateClientJs({}, "Hoge");
    const exportsObject: Record<string, unknown> = {};

    const run = new Function("exports", "LockService", code);
    expect(() => run(exportsObject, { getScriptLock: () => ({}) })).not.toThrow(
      ReferenceError,
    );
    expect(() => exportsObject.Gassma).toThrow(ReferenceError);
  });

  it("should expose Gassma when the generated file is required from node", () => {
    const { filePath } = writeGeneratedModule(generateClientJs({}, "Hoge"));

    const loaded = requireFromHere(filePath);

    expect(Object.keys(loaded)).toContain("Gassma");
    expect(Object.keys(loaded)).toContain("GassmaClient");
  });

  it("should resolve Gassma from the global at access time, not at load time", () => {
    const { filePath } = writeGeneratedModule(generateClientJs({}, "Hoge"));
    const loaded = requireFromHere(filePath);
    const namespace = fakeNamespace();

    Reflect.set(globalThis, "Gassma", namespace);

    expect(loaded.Gassma).toBe(namespace);
  });
});
