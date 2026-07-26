import path from "path";
import { describe, expect, it } from "vitest";
import type { DirectoryStatus } from "../../../bootstrap/env/targetDirectory";
import { createInitialContext } from "../../../bootstrap/flow/context";
import { BootstrapCancelledError } from "../../../bootstrap/flow/prompts";
import { directoryStep } from "../../../bootstrap/flow/steps/directoryStep";
import { createFakePrompter, createTestDeps } from "./testHelpers";

const CWD = "/project";

const baseContext = () =>
  createInitialContext({ cwd: CWD, packageManager: "npm" });

const createFakeDirectoryOps = (status: DirectoryStatus) => {
  const ensured: string[] = [];
  const changedTo: string[] = [];
  return {
    ensured,
    changedTo,
    ops: {
      inspect: () => status,
      ensure: (dirPath: string) => {
        ensured.push(dirPath);
      },
      changeTo: (dirPath: string) => {
        changedTo.push(dirPath);
      },
    },
  };
};

describe("directoryStep", () => {
  it("should use the directory argument without prompting", async () => {
    const fake = createFakeDirectoryOps("missing");
    const prompter = {
      ...createFakePrompter(),
      text: () => Promise.reject(new Error("must not prompt")),
    };
    const deps = createTestDeps({
      prompter,
      directoryArg: "my-app",
      directories: fake.ops,
    });

    const ctx = await directoryStep.run(baseContext(), deps);

    const target = path.join(CWD, "my-app");
    expect(ctx.cwd).toBe(target);
    expect(ctx.title).toBe("my-app");
    expect(fake.ensured).toEqual([target]);
    expect(fake.changedTo).toEqual([target]);
  });

  it("should ask for a directory with the gassma-project default", async () => {
    const fake = createFakeDirectoryOps("missing");
    const deps = createTestDeps({ directories: fake.ops });

    const ctx = await directoryStep.run(baseContext(), deps);

    expect(ctx.cwd).toBe(path.join(CWD, "gassma-project"));
    expect(ctx.title).toBe("gassma-project");
  });

  it("should use the answered directory name", async () => {
    const fake = createFakeDirectoryOps("missing");
    const prompter = createFakePrompter({
      text: { "Project directory?": "answered-app" },
    });
    const deps = createTestDeps({ prompter, directories: fake.ops });

    const ctx = await directoryStep.run(baseContext(), deps);

    expect(ctx.cwd).toBe(path.join(CWD, "answered-app"));
  });

  it("should keep the cwd for '.' without creating a directory", async () => {
    const fake = createFakeDirectoryOps("empty");
    const deps = createTestDeps({
      directoryArg: ".",
      directories: fake.ops,
    });

    const ctx = await directoryStep.run(baseContext(), deps);

    expect(ctx.cwd).toBe(path.resolve(CWD));
    expect(ctx.title).toBe("project");
    expect(fake.ensured).toEqual([]);
    expect(fake.changedTo).toEqual([path.resolve(CWD)]);
  });

  it("should cancel when the user declines a non-empty directory", async () => {
    const fake = createFakeDirectoryOps("nonEmpty");
    const deps = createTestDeps({
      directoryArg: "my-app",
      directories: fake.ops,
    });

    await expect(directoryStep.run(baseContext(), deps)).rejects.toThrow(
      BootstrapCancelledError,
    );
    expect(fake.changedTo).toEqual([]);
  });

  it("should continue when the user accepts a non-empty directory", async () => {
    const fake = createFakeDirectoryOps("nonEmpty");
    const prompter = createFakePrompter({
      confirm: { 'Directory "my-app" is not empty. Continue?': true },
    });
    const deps = createTestDeps({
      prompter,
      directoryArg: "my-app",
      directories: fake.ops,
    });

    const ctx = await directoryStep.run(baseContext(), deps);

    expect(ctx.cwd).toBe(path.join(CWD, "my-app"));
    expect(fake.ensured).toEqual([]);
    expect(fake.changedTo).toEqual([path.join(CWD, "my-app")]);
  });

  it("should continue in a non-empty directory with --yes", async () => {
    const fake = createFakeDirectoryOps("nonEmpty");
    const deps = createTestDeps({
      assumeYes: true,
      directoryArg: "my-app",
      directories: fake.ops,
    });

    const ctx = await directoryStep.run(baseContext(), deps);

    expect(ctx.cwd).toBe(path.join(CWD, "my-app"));
  });

  it("should fail when the target is an existing file", async () => {
    const fake = createFakeDirectoryOps("file");
    const deps = createTestDeps({
      directoryArg: "my-app",
      directories: fake.ops,
    });

    await expect(directoryStep.run(baseContext(), deps)).rejects.toThrow(
      '"my-app" already exists and is not a directory.',
    );
  });

  it("should only plan the directory creation in dry-run mode", async () => {
    const fake = createFakeDirectoryOps("missing");
    const deps = createTestDeps({
      dryRun: true,
      directoryArg: "my-app",
      directories: fake.ops,
    });

    const ctx = await directoryStep.run(baseContext(), deps);

    expect(deps.plannedActions).toEqual(["create directory my-app"]);
    expect(fake.ensured).toEqual([]);
    expect(fake.changedTo).toEqual([]);
    expect(ctx.cwd).toBe(path.join(CWD, "my-app"));
  });

  it("should not plan a directory creation for an existing directory in dry-run mode", async () => {
    const fake = createFakeDirectoryOps("empty");
    const deps = createTestDeps({
      dryRun: true,
      directoryArg: ".",
      directories: fake.ops,
    });

    await directoryStep.run(baseContext(), deps);

    expect(deps.plannedActions).toEqual([]);
    expect(fake.changedTo).toEqual([]);
  });

  it("should detect the package manager from the parent for a missing directory", async () => {
    const fake = createFakeDirectoryOps("missing");
    const detectedFrom: string[] = [];
    const deps = createTestDeps({
      directoryArg: "my-app",
      directories: fake.ops,
      detectPackageManager: (cwd) => {
        detectedFrom.push(cwd);
        return Promise.resolve("pnpm");
      },
    });

    const ctx = await directoryStep.run(baseContext(), deps);

    expect(detectedFrom).toEqual([CWD]);
    expect(ctx.packageManager).toBe("pnpm");
  });

  it("should detect the package manager from an existing target directory", async () => {
    const fake = createFakeDirectoryOps("empty");
    const detectedFrom: string[] = [];
    const deps = createTestDeps({
      directoryArg: "my-app",
      directories: fake.ops,
      detectPackageManager: (cwd) => {
        detectedFrom.push(cwd);
        return Promise.resolve("yarn");
      },
    });

    const ctx = await directoryStep.run(baseContext(), deps);

    expect(detectedFrom).toEqual([path.join(CWD, "my-app")]);
    expect(ctx.packageManager).toBe("yarn");
  });
});
