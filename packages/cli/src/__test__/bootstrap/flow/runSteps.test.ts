import { describe, expect, it } from "vitest";
import {
  createInitialContext,
  runSteps,
} from "../../../bootstrap/flow/context";
import type {
  BootstrapContext,
  BootstrapStep,
} from "../../../bootstrap/flow/context";
import { createTestDeps } from "./testHelpers";

describe("createInitialContext", () => {
  it("should default the title to the directory name", () => {
    const ctx = createInitialContext({
      cwd: "/home/user/my-project",
      packageManager: "npm",
    });

    expect(ctx.title).toBe("my-project");
  });

  it("should use the --yes defaults", () => {
    const ctx = createInitialContext({
      cwd: "/home/user/app",
      packageManager: "pnpm",
    });

    expect(ctx.withSheets).toBe(true);
    expect(ctx.style).toBe("export");
    expect(ctx.wantSample).toBe(true);
    expect(ctx.wantInstall).toBe(true);
    expect(ctx.packageManager).toBe("pnpm");
    expect(ctx.claspCreateSkipped).toBe(false);
    expect(ctx.libraryVersion).toBeNull();
  });
});

describe("runSteps", () => {
  it("should run steps in order and thread the context", async () => {
    const order: string[] = [];
    const stepA: BootstrapStep = {
      id: "a",
      run: (ctx) => {
        order.push("a");
        return Promise.resolve({ ...ctx, title: `${ctx.title}-a` });
      },
    };
    const stepB: BootstrapStep = {
      id: "b",
      run: async (ctx) => {
        await Promise.resolve();
        order.push("b");
        return { ...ctx, title: `${ctx.title}-b` };
      },
    };
    const initial: BootstrapContext = createInitialContext({
      cwd: "/tmp/base",
      packageManager: "npm",
    });

    const finalCtx = await runSteps([stepA, stepB], initial, createTestDeps());

    expect(order).toEqual(["a", "b"]);
    expect(finalCtx.title).toBe("base-a-b");
  });

  it("should return the initial context for an empty step list", async () => {
    const initial = createInitialContext({
      cwd: "/tmp/base",
      packageManager: "npm",
    });

    const finalCtx = await runSteps([], initial, createTestDeps());

    expect(finalCtx).toEqual(initial);
  });
});
