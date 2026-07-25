import os from "os";
import { logLoadedConfig } from "../config/logLoadedConfig";
import { getVersion } from "../version/getVersion";
import { createDebugFs } from "./env/debugFs";
import type { DebugFs } from "./env/debugFs";
import { detectCi as defaultDetectCi } from "./env/detectCi";
import { createTimedExec } from "./env/execWithTimeout";
import type { TimedExecFn } from "./env/execWithTimeout";
import {
  buildAppsscriptLines,
  collectAppsscriptStatus,
} from "./sections/appsscriptSection";
import { buildClaspLines, collectClaspStatus } from "./sections/claspSection";
import { buildConfigLine, collectConfigStatus } from "./sections/configSection";
import { buildEnvVarsLines } from "./sections/envVarsSection";
import {
  buildGeneratedClientLines,
  collectGeneratedClientStatus,
} from "./sections/generatedClientSection";
import {
  buildCiLines,
  buildInteractiveLines,
  isInteractive,
} from "./sections/runtimeSection";
import {
  buildSchemaLines,
  collectSchemaStatus,
} from "./sections/schemaSection";
import { createStyler, resolveColorEnabled } from "./styles";
import { firstLine } from "./util/firstLine";

type DebugOptions = {
  schema?: string;
  config?: string;
};

type DebugOverrides = {
  exec?: TimedExecFn;
  fs?: DebugFs;
  env?: Record<string, string | undefined>;
  homedir?: string;
  stdinIsTty?: boolean;
  stdoutIsTty?: boolean;
  detectCi?: () => boolean;
};

const CLASP_TIMEOUT_MS = 3000;

const printLines = (lines: string[]): void => {
  lines.forEach((line) => console.log(line));
};

const printConfigSection = (configPath: string | undefined): void => {
  const status = collectConfigStatus(configPath);
  if (status.kind === "loaded") {
    logLoadedConfig(status.filePath);
    return;
  }
  console.log(buildConfigLine(status));
};

const runDebug = async (
  options: DebugOptions,
  overrides: DebugOverrides,
): Promise<void> => {
  const env = overrides.env ?? process.env;
  const fs = overrides.fs ?? createDebugFs();
  const exec = overrides.exec ?? createTimedExec();
  const homedir = overrides.homedir ?? os.homedir();
  const stdinIsTty = overrides.stdinIsTty ?? process.stdin.isTTY === true;
  const stdoutIsTty = overrides.stdoutIsTty ?? process.stdout.isTTY === true;
  const detectCi = overrides.detectCi ?? defaultDetectCi;
  const cwd = process.cwd();
  const styler = createStyler(resolveColorEnabled(env, stdoutIsTty));

  console.log(`gassma debug — gassma v${getVersion()}`);
  console.log("");
  printConfigSection(options.config);
  console.log("");

  const schemaStatus = collectSchemaStatus(options);
  printLines(buildSchemaLines(schemaStatus, styler));
  console.log("");

  printLines(buildEnvVarsLines(env, styler));
  console.log("");

  const claspStatus = await collectClaspStatus({
    exec,
    fs,
    homedir,
    cwd,
    timeoutMs: CLASP_TIMEOUT_MS,
  });
  printLines(buildClaspLines(claspStatus, styler));
  console.log("");

  const appsscriptStatus = collectAppsscriptStatus({
    fs,
    cwd,
    rootDir: claspStatus.project.rootDir,
  });
  printLines(buildAppsscriptLines(appsscriptStatus, cwd, styler));
  console.log("");

  const generatedStatus = collectGeneratedClientStatus(
    { fs, cwd },
    schemaStatus,
  );
  printLines(buildGeneratedClientLines(generatedStatus, cwd, styler));
  console.log("");

  printLines(
    buildInteractiveLines(isInteractive(stdinIsTty, env.TERM), styler),
  );
  console.log("");
  printLines(buildCiLines(detectCi(), styler));
};

const debugCommand = async (
  options: DebugOptions = {},
  overrides: DebugOverrides = {},
): Promise<void> => {
  try {
    await runDebug(options, overrides);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`debug: unexpected error (${firstLine(message)})`);
  }
};

export { debugCommand };
export type { DebugOptions, DebugOverrides };
