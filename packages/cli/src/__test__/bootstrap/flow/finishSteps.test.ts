import { describe, expect, it } from "vitest";
import { createInitialContext } from "../../../bootstrap/flow/context";
import {
  installRunStep,
  nextStepsStep,
} from "../../../bootstrap/flow/steps/finishSteps";
import {
  createFakePrompter,
  createScriptedExec,
  createTestDeps,
} from "./testHelpers";

const baseContext = () =>
  createInitialContext({ cwd: "/project", packageManager: "pnpm" });

describe("installRunStep", () => {
  it("should install dependencies with the detected package manager", async () => {
    const { calls, exec } = createScriptedExec();
    const deps = createTestDeps({ exec });

    await installRunStep.run(baseContext(), deps);

    expect(calls).toEqual([
      {
        command: "pnpm",
        args: ["install"],
        options: { cwd: "/project", inherit: true },
      },
    ]);
  });

  it("should skip the run with guidance when --skip-install is given", async () => {
    const { calls, exec } = createScriptedExec();
    const prompter = createFakePrompter();
    const deps = createTestDeps({ exec, prompter, skipInstall: true });

    await installRunStep.run(baseContext(), deps);

    expect(calls).toHaveLength(0);
    expect(prompter.infos.join(" ")).toContain("pnpm install");
  });

  it("should skip the run when the user declined the install", async () => {
    const { calls, exec } = createScriptedExec();
    const prompter = createFakePrompter();
    const deps = createTestDeps({ exec, prompter });

    await installRunStep.run({ ...baseContext(), wantInstall: false }, deps);

    expect(calls).toHaveLength(0);
    expect(prompter.infos.join(" ")).toContain("pnpm install");
  });

  it("should warn but not fail when the install fails", async () => {
    const { exec } = createScriptedExec(() => ({
      ok: false,
      exitCode: 1,
      stdout: "",
      stderr: "network down",
    }));
    const prompter = createFakePrompter();
    const deps = createTestDeps({ exec, prompter });

    const ctx = await installRunStep.run(baseContext(), deps);

    expect(ctx.wantInstall).toBe(true);
    expect(prompter.warns.join(" ")).toContain("pnpm install");
  });
});

describe("nextStepsStep", () => {
  it("should show next steps with package-manager-aware commands", async () => {
    const prompter = createFakePrompter();
    const deps = createTestDeps({ prompter });

    await nextStepsStep.run(baseContext(), deps);

    expect(prompter.notes).toHaveLength(1);
    expect(prompter.notes[0].title).toBe("Next steps");
    expect(prompter.notes[0].message).toContain('"pnpm run deploy"');
    expect(prompter.notes[0].message).toContain('"npx gassma generate"');
    expect(prompter.notes[0].message).toContain('"npx clasp open"');
    expect(prompter.notes[0].message).toContain(".clasp.json is gitignored");
    expect(prompter.outros.join(" ")).toContain("Bootstrap complete");
  });

  it("should not tell the user to install when dependencies were installed", async () => {
    const prompter = createFakePrompter();
    const deps = createTestDeps({ prompter });

    await nextStepsStep.run(baseContext(), deps);

    expect(prompter.notes[0].message).not.toContain("pnpm install");
  });

  it("should tell the user to install first when the install was skipped", async () => {
    const prompter = createFakePrompter();
    const deps = createTestDeps({ prompter, skipInstall: true });

    await nextStepsStep.run(baseContext(), deps);

    expect(prompter.notes[0].message).toContain('"pnpm install"');
  });

  it("should list planned actions instead in dry-run mode", async () => {
    const prompter = createFakePrompter();
    const deps = createTestDeps({ prompter, dryRun: true });
    deps.plan("run clasp create-script --type sheets");
    deps.plan("write package.json");

    await nextStepsStep.run(baseContext(), deps);

    expect(prompter.notes[0].title).toContain("dry run");
    expect(prompter.notes[0].message).toContain(
      "run clasp create-script --type sheets",
    );
    expect(prompter.notes[0].message).toContain("write package.json");
    expect(prompter.outros.join(" ")).toContain("Dry run complete");
  });
});
