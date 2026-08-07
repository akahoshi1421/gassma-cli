import { describe, expect, it } from "vitest";
import type { FileStore } from "../../../bootstrap/env/fileStore";
import { createDryEnv, createRealEnv } from "../../../bootstrap/flow/io";

const createMemoryStore = (initial: Record<string, string>) => {
  const files = new Map(Object.entries(initial));
  const store: FileStore = {
    exists: (filePath) => files.has(filePath),
    read: (filePath) => {
      const content = files.get(filePath);
      if (content === undefined) throw new Error(`missing: ${filePath}`);
      return content;
    },
    write: (filePath, content) => {
      files.set(filePath, content);
    },
  };
  return { files, store };
};

describe("createRealEnv", () => {
  it("should write through to the underlying store", () => {
    const { files, store } = createMemoryStore({});
    const env = createRealEnv(store, () =>
      Promise.resolve({ ok: true, exitCode: 0, stdout: "", stderr: "" }),
    );

    env.store.write("/p/file.txt", "content");

    expect(files.get("/p/file.txt")).toBe("content");
    expect(env.plannedActions).toEqual([]);
  });
});

describe("createDryEnv", () => {
  it("should record writes without touching the store", () => {
    const { files, store } = createMemoryStore({});
    const env = createDryEnv(store, "/project");

    env.store.write("/project/package.json", "content");

    expect(files.size).toBe(0);
    expect(env.plannedActions).toEqual(["write package.json"]);
  });

  it("should pass reads through to the real store", () => {
    const { store } = createMemoryStore({ "/project/a.txt": "hello" });
    const env = createDryEnv(store, "/project");

    expect(env.store.exists("/project/a.txt")).toBe(true);
    expect(env.store.read("/project/a.txt")).toBe("hello");
  });

  it("should record commands and fake a success result", async () => {
    const { store } = createMemoryStore({});
    const env = createDryEnv(store, "/project");

    const result = await env.exec("clasp", [
      "create-script",
      "--title",
      "My App",
    ]);

    expect(result.ok).toBe(true);
    expect(env.plannedActions).toEqual([
      'run clasp create-script --title "My App"',
    ]);
  });

  it("should collect manual plan entries", () => {
    const { store } = createMemoryStore({});
    const env = createDryEnv(store, "/project");

    env.plan("run gassma init");

    expect(env.plannedActions).toContain("run gassma init");
  });
});
