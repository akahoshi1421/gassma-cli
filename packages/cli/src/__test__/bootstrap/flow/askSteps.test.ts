import { describe, expect, it } from "vitest";
import { createInitialContext } from "../../../bootstrap/flow/context";
import {
  installPromptStep,
  sampleStep,
  sheetsStep,
  styleStep,
  titleStep,
} from "../../../bootstrap/flow/steps/askSteps";
import {
  createFakePrompter,
  createMemoryStore,
  createTestDeps,
} from "./testHelpers";

const CWD = "/project";

const baseContext = () =>
  createInitialContext({ cwd: CWD, packageManager: "npm" });

describe("titleStep", () => {
  it("should store the answered title", async () => {
    const prompter = createFakePrompter({
      text: { "Project title?": "My Cool App" },
    });
    const deps = createTestDeps({ prompter });

    const ctx = await titleStep.run(baseContext(), deps);

    expect(ctx.title).toBe("My Cool App");
  });

  it("should default to the directory name", async () => {
    const deps = createTestDeps();

    const ctx = await titleStep.run(baseContext(), deps);

    expect(ctx.title).toBe("project");
  });
});

describe("sheetsStep", () => {
  it("should record the sheets answer", async () => {
    const prompter = createFakePrompter({
      confirm: { "Create a new spreadsheet as well?": false },
    });
    const deps = createTestDeps({ prompter });

    const ctx = await sheetsStep.run(baseContext(), deps);

    expect(ctx.withSheets).toBe(false);
    expect(ctx.claspCreateSkipped).toBe(false);
  });

  it("should skip clasp create when .clasp.json already exists", async () => {
    const { store } = createMemoryStore({ "/project/.clasp.json": "{}" });
    const prompter = createFakePrompter();
    const deps = createTestDeps({ prompter, store });

    const ctx = await sheetsStep.run(baseContext(), deps);

    expect(ctx.claspCreateSkipped).toBe(true);
    expect(prompter.infos.join(" ")).toContain("Skipping clasp create-script");
  });
});

describe("styleStep", () => {
  it("should show both style samples before asking", async () => {
    const prompter = createFakePrompter();
    const deps = createTestDeps({ prompter });

    await styleStep.run(baseContext(), deps);

    expect(prompter.notes).toHaveLength(2);
    expect(prompter.notes[0].title).toContain("export");
    expect(prompter.notes[0].message).toContain(
      'export const main = () => console.log("Hello GAS!");',
    );
    expect(prompter.notes[1].title).toContain("global");
    expect(prompter.notes[1].message).toContain("global.main = main;");
  });

  it("should store the selected style", async () => {
    const prompter = createFakePrompter({
      select: { "Function exposure style?": "global" },
    });
    const deps = createTestDeps({ prompter });

    const ctx = await styleStep.run(baseContext(), deps);

    expect(ctx.style).toBe("global");
  });

  it("should default to the export style", async () => {
    const deps = createTestDeps();

    const ctx = await styleStep.run(baseContext(), deps);

    expect(ctx.style).toBe("export");
  });
});

describe("sampleStep", () => {
  it("should record the sample answer", async () => {
    const prompter = createFakePrompter({
      confirm: { "Generate a sample src/index.ts?": false },
    });
    const deps = createTestDeps({ prompter });

    const ctx = await sampleStep.run(baseContext(), deps);

    expect(ctx.wantSample).toBe(false);
  });
});

describe("installPromptStep", () => {
  it("should mention the detected package manager in the question", async () => {
    const prompter = createFakePrompter({
      confirm: { "Install dependencies now? (pnpm i)": false },
    });
    const deps = createTestDeps({ prompter });
    const ctx = {
      ...createInitialContext({ cwd: CWD, packageManager: "pnpm" }),
    };

    const result = await installPromptStep.run(ctx, deps);

    expect(result.wantInstall).toBe(false);
  });

  it("should not ask when --skip-install is given", async () => {
    const prompter = createFakePrompter({
      confirm: { "Install dependencies now? (npm i)": false },
    });
    const deps = createTestDeps({ prompter, skipInstall: true });

    const ctx = await installPromptStep.run(baseContext(), deps);

    expect(ctx.wantInstall).toBe(true);
  });
});
