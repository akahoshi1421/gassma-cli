import * as clack from "@clack/prompts";

class BootstrapCancelledError extends Error {
  constructor() {
    super("Bootstrap cancelled.");
    this.name = "BootstrapCancelledError";
  }
}

type SelectChoice<T extends string> = {
  value: T;
  label: string;
  hint?: string;
};

type Prompter = {
  intro: (message: string) => void;
  outro: (message: string) => void;
  note: (message: string, title: string) => void;
  info: (message: string) => void;
  warn: (message: string) => void;
  text: (message: string, defaultValue: string) => Promise<string>;
  confirm: (message: string, defaultValue: boolean) => Promise<boolean>;
  select: <T extends string>(
    message: string,
    choices: SelectChoice<T>[],
    defaultValue: T,
  ) => Promise<T>;
};

const unwrap = <T extends string | boolean>(value: T | symbol): T => {
  if (clack.isCancel(value)) throw new BootstrapCancelledError();
  return value;
};

const createClackPrompter = (): Prompter => ({
  intro: (message) => clack.intro(message),
  outro: (message) => clack.outro(message),
  note: (message, title) => clack.note(message, title),
  info: (message) => clack.log.info(message),
  warn: (message) => clack.log.warn(message),
  text: async (message, defaultValue) =>
    unwrap(
      await clack.text({ message, placeholder: defaultValue, defaultValue }),
    ),
  confirm: async (message, defaultValue) =>
    unwrap(await clack.confirm({ message, initialValue: defaultValue })),
  select: async (message, choices, defaultValue) => {
    const answer = unwrap(
      await clack.select<string>({
        message,
        options: choices,
        initialValue: defaultValue,
      }),
    );
    const matched = choices.find((choice) => choice.value === answer);
    return matched === undefined ? defaultValue : matched.value;
  },
});

const createAutoPrompter = (): Prompter => ({
  intro: (message) => console.log(message),
  outro: (message) => console.log(`\n${message}`),
  note: (message, title) => console.log(`\n[${title}]\n${message}`),
  info: (message) => console.log(message),
  warn: (message) => console.warn(message),
  text: (message, defaultValue) => {
    console.log(`${message} -> ${defaultValue}`);
    return Promise.resolve(defaultValue);
  },
  confirm: (message, defaultValue) => {
    console.log(`${message} -> ${defaultValue ? "yes" : "no"}`);
    return Promise.resolve(defaultValue);
  },
  select: <T extends string>(
    message: string,
    _choices: SelectChoice<T>[],
    defaultValue: T,
  ) => {
    console.log(`${message} -> ${defaultValue}`);
    return Promise.resolve(defaultValue);
  },
});

const createDryRunPrompter = (base: Prompter): Prompter => ({
  ...base,
  info: (message) => base.info(`[dry-run] ${message}`),
  warn: (message) => base.warn(`[dry-run] ${message}`),
});

export {
  BootstrapCancelledError,
  createAutoPrompter,
  createClackPrompter,
  createDryRunPrompter,
};
export type { Prompter, SelectChoice };
