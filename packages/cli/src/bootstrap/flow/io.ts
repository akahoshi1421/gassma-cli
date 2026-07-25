import path from "path";
import type { ExecFn } from "../env/execCommand";
import type { FileStore } from "../env/fileStore";

type BootstrapEnv = {
  store: FileStore;
  exec: ExecFn;
  plan: (action: string) => void;
  plannedActions: readonly string[];
};

const createRealEnv = (store: FileStore, exec: ExecFn): BootstrapEnv => ({
  store,
  exec,
  plan: () => undefined,
  plannedActions: [],
});

const formatArg = (arg: string): string =>
  arg.includes(" ") ? `"${arg}"` : arg;

const createDryEnv = (realStore: FileStore, cwd: string): BootstrapEnv => {
  const actions: string[] = [];
  const plan = (action: string) => {
    actions.push(action);
  };

  const store: FileStore = {
    exists: (filePath) => realStore.exists(filePath),
    read: (filePath) => realStore.read(filePath),
    write: (filePath) => {
      const relative = path.relative(cwd, filePath);
      plan(`write ${relative === "" ? filePath : relative}`);
    },
  };

  const exec: ExecFn = (command, args) => {
    plan(`run ${[command, ...args].map(formatArg).join(" ")}`);
    return Promise.resolve({ ok: true, exitCode: 0, stdout: "", stderr: "" });
  };

  return { store, exec, plan, plannedActions: actions };
};

export { createDryEnv, createRealEnv };
export type { BootstrapEnv };
