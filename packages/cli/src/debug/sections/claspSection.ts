import path from "path";
import { isRecord } from "../../bootstrap/util/isRecord";
import type { DebugFs } from "../env/debugFs";
import type { TimedExecFn } from "../env/execWithTimeout";
import type { Styler } from "../styles";
import { firstLine } from "../util/firstLine";

type ClaspVersion =
  | { kind: "found"; version: string }
  | { kind: "notFound" }
  | { kind: "timedOut" }
  | { kind: "failed" };

type ClaspProject = {
  exists: boolean;
  parseError?: boolean;
  rootDir?: string;
  scriptId?: string;
};

type ClaspStatus = {
  version: ClaspVersion;
  loggedIn: boolean;
  project: ClaspProject;
};

type ClaspDeps = {
  exec: TimedExecFn;
  fs: DebugFs;
  homedir: string;
  cwd: string;
  timeoutMs: number;
};

const detectClaspVersion = async (deps: ClaspDeps): Promise<ClaspVersion> => {
  const result = await deps.exec("clasp", ["-v"], deps.timeoutMs);
  if (result.timedOut) return { kind: "timedOut" };
  if (result.ok) {
    const version = firstLine(result.stdout.trim());
    return { kind: "found", version: version === "" ? "unknown" : version };
  }
  if (result.exitCode === null) return { kind: "notFound" };
  return { kind: "failed" };
};

const readClaspProject = (deps: ClaspDeps): ClaspProject => {
  const claspJsonPath = path.join(deps.cwd, ".clasp.json");
  if (!deps.fs.exists(claspJsonPath)) return { exists: false };

  try {
    const parsed: unknown = JSON.parse(deps.fs.readText(claspJsonPath));
    if (!isRecord(parsed)) return { exists: true, parseError: true };
    return {
      exists: true,
      ...(typeof parsed.rootDir === "string"
        ? { rootDir: parsed.rootDir }
        : {}),
      ...(typeof parsed.scriptId === "string"
        ? { scriptId: parsed.scriptId }
        : {}),
    };
  } catch {
    return { exists: true, parseError: true };
  }
};

const collectClaspStatus = async (deps: ClaspDeps): Promise<ClaspStatus> => ({
  version: await detectClaspVersion(deps),
  loggedIn: deps.fs.exists(path.join(deps.homedir, ".clasprc.json")),
  project: readClaspProject(deps),
});

const maskScriptId = (scriptId: string): string => `${scriptId.slice(0, 4)}…`;

const buildVersionLine = (version: ClaspVersion): string => {
  if (version.kind === "found") {
    return `clasp: found in PATH (version ${version.version})`;
  }
  if (version.kind === "notFound") {
    return "clasp: not detected (not found in PATH)";
  }
  if (version.kind === "timedOut") {
    return "clasp: not detected (`clasp -v` timed out)";
  }
  return "clasp: not detected (`clasp -v` failed)";
};

const buildProjectLine = (project: ClaspProject): string => {
  if (!project.exists) return "Project: .clasp.json not found";
  if (project.parseError === true) {
    return "Project: .clasp.json found (could not be parsed)";
  }
  const rootDir = project.rootDir ?? "(not set)";
  const scriptId =
    project.scriptId === undefined
      ? "(not set)"
      : maskScriptId(project.scriptId);
  return `Project: .clasp.json found (rootDir: ${rootDir}, scriptId: ${scriptId})`;
};

const buildClaspLines = (status: ClaspStatus, styler: Styler): string[] => [
  styler.heading("-- clasp --"),
  buildVersionLine(status.version),
  status.loggedIn
    ? "Auth: logged in (~/.clasprc.json exists)"
    : "Auth: not logged in (~/.clasprc.json not found)",
  buildProjectLine(status.project),
];

export { buildClaspLines, collectClaspStatus, maskScriptId };
export type { ClaspStatus };
