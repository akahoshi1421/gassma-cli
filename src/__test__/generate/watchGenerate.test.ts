import fs from "fs";
import path from "path";
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  type Mock,
} from "vitest";
import { watchGenerate } from "../../generate/watchGenerate";

vi.mock("fs");
vi.mock("../../generate/generate", () => ({
  generate: vi.fn(),
}));
vi.mock("../../config/resolveSchemaFiles", () => ({
  resolveSchemaFiles: vi.fn(),
}));

const mockFs = vi.mocked(fs);

import { generate } from "../../generate/generate";
import { resolveSchemaFiles } from "../../config/resolveSchemaFiles";

const mockGenerate = vi.mocked(generate);
const mockResolveSchemaFiles = vi.mocked(resolveSchemaFiles);

describe("watchGenerate", () => {
  let mockWatcher: { close: Mock };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    mockWatcher = { close: vi.fn() };
    mockFs.watch.mockReturnValue(mockWatcher as unknown as fs.FSWatcher);
    mockResolveSchemaFiles.mockReturnValue([
      { filePath: "gassma/schema.prisma", displayName: "schema.prisma" },
    ]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should run generate once on start", () => {
    watchGenerate();
    expect(mockGenerate).toHaveBeenCalledTimes(1);
  });

  it("should pass schema option to generate and resolveSchemaFiles", () => {
    watchGenerate({ schema: "custom/path.prisma" });
    expect(mockGenerate).toHaveBeenCalledWith({ schema: "custom/path.prisma" });
    expect(mockResolveSchemaFiles).toHaveBeenCalledWith({
      schema: "custom/path.prisma",
      config: undefined,
    });
  });

  it("should pass config option to generate and resolveSchemaFiles", () => {
    watchGenerate({ config: "conf/custom.config.ts" });
    expect(mockGenerate).toHaveBeenCalledWith({
      config: "conf/custom.config.ts",
    });
    expect(mockResolveSchemaFiles).toHaveBeenCalledWith({
      schema: undefined,
      config: "conf/custom.config.ts",
    });
  });

  it("should watch the directory of schema files", () => {
    mockResolveSchemaFiles.mockReturnValue([
      { filePath: "gassma/schema.prisma", displayName: "schema.prisma" },
    ]);
    watchGenerate();
    expect(mockFs.watch).toHaveBeenCalledWith("gassma", expect.any(Function));
  });

  it("should re-generate when a .prisma file changes", () => {
    watchGenerate();
    mockGenerate.mockClear();

    const watchCallback = mockFs.watch.mock.calls[0][1] as (
      event: string,
      filename: string | null,
    ) => void;
    watchCallback("change", "schema.prisma");

    expect(mockGenerate).toHaveBeenCalledTimes(1);
  });

  it("should not re-generate when a non-.prisma file changes", () => {
    watchGenerate();
    mockGenerate.mockClear();

    const watchCallback = mockFs.watch.mock.calls[0][1] as (
      event: string,
      filename: string | null,
    ) => void;
    watchCallback("change", "readme.md");

    expect(mockGenerate).toHaveBeenCalledTimes(0);
  });

  it("should not re-generate when filename is null", () => {
    watchGenerate();
    mockGenerate.mockClear();

    const watchCallback = mockFs.watch.mock.calls[0][1] as (
      event: string,
      filename: string | null,
    ) => void;
    watchCallback("change", null);

    expect(mockGenerate).toHaveBeenCalledTimes(0);
  });

  it("should return a close function that stops the watcher", () => {
    const close = watchGenerate();
    close();
    expect(mockWatcher.close).toHaveBeenCalledTimes(1);
  });

  it("should watch multiple directories when schema files are in different dirs", () => {
    mockResolveSchemaFiles.mockReturnValue([
      { filePath: "gassma/schema.prisma", displayName: "schema.prisma" },
      { filePath: "gassma/models/user.prisma", displayName: "user.prisma" },
    ]);
    watchGenerate();
    expect(mockFs.watch).toHaveBeenCalledWith("gassma", expect.any(Function));
    expect(mockFs.watch).toHaveBeenCalledWith(
      path.join("gassma", "models"),
      expect.any(Function),
    );
  });

  it("should not duplicate watchers for the same directory", () => {
    mockResolveSchemaFiles.mockReturnValue([
      { filePath: "gassma/schema.prisma", displayName: "schema.prisma" },
      { filePath: "gassma/base.prisma", displayName: "base.prisma" },
    ]);
    watchGenerate();
    expect(mockFs.watch).toHaveBeenCalledTimes(1);
  });
});
