import { afterEach, describe, expect, it, vi } from "vitest";
import { GASSMA_LIBRARY } from "../../../bootstrap/const/gassmaLibrary";
import type { ExecFn } from "../../../bootstrap/env/execCommand";
import {
  GASSMA_PACKAGE_JSON_URL,
  createDefaultFetchText,
  fetchLatestLibraryVersion,
} from "../../../bootstrap/env/fetchLatestLibraryVersion";
import type { FetchTextFn } from "../../../bootstrap/env/fetchLatestLibraryVersion";

const execWithStdout =
  (stdout: string): ExecFn =>
  () =>
    Promise.resolve({ ok: true, exitCode: 0, stdout, stderr: "" });

const failingExec: ExecFn = () =>
  Promise.resolve({ ok: false, exitCode: 1, stdout: "", stderr: "auth" });

const unusedFetch: FetchTextFn = () =>
  Promise.reject(new Error("fetch should not be called"));

const fetchWithBody = (body: string) => {
  const urls: string[] = [];
  const fetchText: FetchTextFn = (url) => {
    urls.push(url);
    return Promise.resolve(body);
  };
  return { urls, fetchText };
};

const failingFetch: FetchTextFn = () =>
  Promise.reject(new Error("network down"));

describe("fetchLatestLibraryVersion", () => {
  it("should query clasp list-versions with the library script id", async () => {
    const calls: string[][] = [];
    const exec: ExecFn = (command, args) => {
      calls.push([command, ...args]);
      return Promise.resolve({
        ok: true,
        exitCode: 0,
        stdout: JSON.stringify([{ versionNumber: 1 }]),
        stderr: "",
      });
    };

    await fetchLatestLibraryVersion(exec, unusedFetch);

    expect(calls).toEqual([
      ["clasp", "list-versions", GASSMA_LIBRARY.scriptId, "--json"],
    ]);
  });

  it("should return the maximum version number as a string", async () => {
    const stdout = JSON.stringify([
      { versionNumber: 3, description: "x" },
      { versionNumber: 9, description: "y" },
      { versionNumber: 7, description: "z" },
    ]);

    await expect(
      fetchLatestLibraryVersion(execWithStdout(stdout), unusedFetch),
    ).resolves.toBe("9");
  });

  it("should support an object with a versions array", async () => {
    const stdout = JSON.stringify({
      versions: [{ versionNumber: 2 }, { versionNumber: 5 }],
    });

    await expect(
      fetchLatestLibraryVersion(execWithStdout(stdout), unusedFetch),
    ).resolves.toBe("5");
  });

  it("should ignore entries without a numeric versionNumber", async () => {
    const stdout = JSON.stringify([
      { versionNumber: "8" },
      { versionNumber: 4 },
      { other: true },
    ]);

    await expect(
      fetchLatestLibraryVersion(execWithStdout(stdout), unusedFetch),
    ).resolves.toBe("4");
  });

  it("should fetch the version from the GitHub package.json when clasp fails", async () => {
    const { urls, fetchText } = fetchWithBody(
      JSON.stringify({ name: "gassma", version: "7" }),
    );

    await expect(
      fetchLatestLibraryVersion(failingExec, fetchText),
    ).resolves.toBe("7");
    expect(urls).toEqual([GASSMA_PACKAGE_JSON_URL]);
  });

  it("should fall back to GitHub for invalid clasp JSON output", async () => {
    const { fetchText } = fetchWithBody(JSON.stringify({ version: "8" }));

    await expect(
      fetchLatestLibraryVersion(execWithStdout("not json"), fetchText),
    ).resolves.toBe("8");
  });

  it("should fall back to GitHub for an empty clasp version list", async () => {
    const { fetchText } = fetchWithBody(JSON.stringify({ version: "8" }));

    await expect(
      fetchLatestLibraryVersion(execWithStdout("[]"), fetchText),
    ).resolves.toBe("8");
  });

  it("should return null when clasp fails and the fetch rejects", async () => {
    await expect(
      fetchLatestLibraryVersion(failingExec, failingFetch),
    ).resolves.toBeNull();
  });

  it("should return null when the fetch times out", async () => {
    const timeoutFetch: FetchTextFn = () =>
      Promise.reject(
        new DOMException("The operation timed out", "TimeoutError"),
      );

    await expect(
      fetchLatestLibraryVersion(failingExec, timeoutFetch),
    ).resolves.toBeNull();
  });

  it("should return null for a broken GitHub package.json", async () => {
    const { fetchText } = fetchWithBody("{broken");

    await expect(
      fetchLatestLibraryVersion(failingExec, fetchText),
    ).resolves.toBeNull();
  });

  it("should return null when the GitHub version is not a string", async () => {
    const { fetchText } = fetchWithBody(JSON.stringify({ version: 7 }));

    await expect(
      fetchLatestLibraryVersion(failingExec, fetchText),
    ).resolves.toBeNull();
  });

  it("should return null when the GitHub version is empty", async () => {
    const { fetchText } = fetchWithBody(JSON.stringify({ version: "" }));

    await expect(
      fetchLatestLibraryVersion(failingExec, fetchText),
    ).resolves.toBeNull();
  });
});

describe("createDefaultFetchText", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should fetch the url with a timeout signal and return the body", async () => {
    const calls: { url: unknown; init?: { signal?: unknown } }[] = [];
    vi.stubGlobal("fetch", (url: unknown, init?: { signal?: unknown }) => {
      calls.push({ url, init });
      return Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve("body"),
      });
    });

    await expect(
      createDefaultFetchText()("https://example.com/x"),
    ).resolves.toBe("body");
    expect(calls[0].url).toBe("https://example.com/x");
    expect(calls[0].init?.signal).toBeInstanceOf(AbortSignal);
  });

  it("should throw for a non-ok response", async () => {
    vi.stubGlobal("fetch", () =>
      Promise.resolve({
        ok: false,
        status: 404,
        text: () => Promise.resolve(""),
      }),
    );

    await expect(
      createDefaultFetchText()("https://example.com/x"),
    ).rejects.toThrow("404");
  });
});
