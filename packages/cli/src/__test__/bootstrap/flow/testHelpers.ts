import type {
  ExecFn,
  ExecOptions,
  ExecResult,
} from "../../../bootstrap/env/execCommand";
import { loadBootstrapTemplates } from "../../../bootstrap/env/readTemplate";
import type { FileStore } from "../../../bootstrap/env/fileStore";
import type { BootstrapDeps } from "../../../bootstrap/flow/context";
import type { Prompter, SelectChoice } from "../../../bootstrap/flow/prompts";

type PromptAnswers = {
  text?: Record<string, string>;
  confirm?: Record<string, boolean>;
  select?: Record<string, string>;
};

type FakePrompter = Prompter & {
  notes: { title: string; message: string }[];
  infos: string[];
  warns: string[];
  outros: string[];
};

const createFakePrompter = (answers: PromptAnswers = {}): FakePrompter => {
  const notes: { title: string; message: string }[] = [];
  const infos: string[] = [];
  const warns: string[] = [];
  const outros: string[] = [];

  return {
    notes,
    infos,
    warns,
    outros,
    intro: () => undefined,
    outro: (message) => {
      outros.push(message);
    },
    note: (message, title) => {
      notes.push({ title, message });
    },
    info: (message) => {
      infos.push(message);
    },
    warn: (message) => {
      warns.push(message);
    },
    text: (message, defaultValue) =>
      Promise.resolve(answers.text?.[message] ?? defaultValue),
    confirm: (message, defaultValue) =>
      Promise.resolve(answers.confirm?.[message] ?? defaultValue),
    select: <T extends string>(
      message: string,
      choices: SelectChoice<T>[],
      defaultValue: T,
    ) => {
      const wanted = answers.select?.[message];
      const matched = choices.find((choice) => choice.value === wanted);
      return Promise.resolve(
        matched === undefined ? defaultValue : matched.value,
      );
    },
  };
};

const createMemoryStore = (initial: Record<string, string> = {}) => {
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

type ExecCall = { command: string; args: string[]; options?: ExecOptions };

const createScriptedExec = (
  script?: (call: ExecCall) => ExecResult | undefined,
) => {
  const calls: ExecCall[] = [];
  const exec: ExecFn = (command, args, options) => {
    const call = { command, args, options };
    calls.push(call);
    const result = script?.(call);
    return Promise.resolve(
      result ?? { ok: true, exitCode: 0, stdout: "", stderr: "" },
    );
  };
  return { calls, exec };
};

const createTestDeps = (
  overrides: Partial<BootstrapDeps> = {},
): BootstrapDeps => {
  const planned: string[] = [];

  return {
    prompter: createFakePrompter(),
    store: createMemoryStore().store,
    exec: () =>
      Promise.resolve({ ok: true, exitCode: 0, stdout: "", stderr: "" }),
    fetchText: () => Promise.reject(new Error("fetch unavailable in tests")),
    plan: (action) => {
      planned.push(action);
    },
    plannedActions: planned,
    dryRun: false,
    skipInstall: false,
    gassmaVersion: "1.1.0",
    templates: loadBootstrapTemplates(),
    ...overrides,
  };
};

export {
  createFakePrompter,
  createMemoryStore,
  createScriptedExec,
  createTestDeps,
};
export type { ExecCall, FakePrompter, PromptAnswers };
