import path from "path";
import { GASSMA_LIBRARY } from "../../bootstrap/const/gassmaLibrary";
import { isRecord } from "../../bootstrap/util/isRecord";
import type { DebugFs } from "../env/debugFs";
import type { Styler } from "../styles";

type AppsscriptLibrary = {
  userSymbol?: string;
  version?: string;
  developmentMode?: boolean;
};

type AppsscriptStatus =
  | { kind: "notFound"; searched: string[] }
  | { kind: "parseError"; manifestPath: string }
  | {
      kind: "found";
      manifestPath: string;
      runtimeVersion?: string;
      library?: AppsscriptLibrary;
    };

type AppsscriptDeps = {
  fs: DebugFs;
  cwd: string;
  rootDir: string | undefined;
};

const buildCandidates = (deps: AppsscriptDeps): string[] => {
  const candidates = [
    ...(deps.rootDir === undefined
      ? []
      : [path.resolve(deps.cwd, deps.rootDir, "appsscript.json")]),
    path.resolve(deps.cwd, "dist", "appsscript.json"),
    path.resolve(deps.cwd, "appsscript.json"),
  ];
  return [...new Set(candidates)];
};

const readLibraryEntries = (manifest: Record<string, unknown>): unknown[] => {
  const dependencies = manifest.dependencies;
  if (!isRecord(dependencies)) return [];
  const libraries = dependencies.libraries;
  return Array.isArray(libraries) ? libraries : [];
};

const toLibrary = (entry: Record<string, unknown>): AppsscriptLibrary => ({
  ...(typeof entry.userSymbol === "string"
    ? { userSymbol: entry.userSymbol }
    : {}),
  ...(typeof entry.version === "string" || typeof entry.version === "number"
    ? { version: String(entry.version) }
    : {}),
  ...(typeof entry.developmentMode === "boolean"
    ? { developmentMode: entry.developmentMode }
    : {}),
});

const findGassmaLibrary = (
  manifest: Record<string, unknown>,
): AppsscriptLibrary | undefined => {
  const entries = readLibraryEntries(manifest).filter(isRecord);
  const byId = entries.find((e) => e.libraryId === GASSMA_LIBRARY.scriptId);
  const bySymbol = entries.find(
    (e) => e.userSymbol === GASSMA_LIBRARY.userSymbol,
  );
  const entry = byId ?? bySymbol;
  return entry === undefined ? undefined : toLibrary(entry);
};

const collectAppsscriptStatus = (deps: AppsscriptDeps): AppsscriptStatus => {
  const searched = buildCandidates(deps);
  const manifestPath = searched.find((candidate) => deps.fs.exists(candidate));
  if (manifestPath === undefined) return { kind: "notFound", searched };

  try {
    const manifest: unknown = JSON.parse(deps.fs.readText(manifestPath));
    if (!isRecord(manifest)) return { kind: "parseError", manifestPath };
    return {
      kind: "found",
      manifestPath,
      ...(typeof manifest.runtimeVersion === "string"
        ? { runtimeVersion: manifest.runtimeVersion }
        : {}),
      ...(() => {
        const library = findGassmaLibrary(manifest);
        return library === undefined ? {} : { library };
      })(),
    };
  } catch {
    return { kind: "parseError", manifestPath };
  }
};

const buildRuntimeVersionLine = (
  runtimeVersion: string | undefined,
): string => {
  if (runtimeVersion === "V8") return "runtimeVersion: V8";
  if (runtimeVersion === undefined) return "runtimeVersion: not set (not V8)";
  return `runtimeVersion: ${runtimeVersion} (not V8)`;
};

const buildUserSymbolLine = (userSymbol: string | undefined): string => {
  const expected = GASSMA_LIBRARY.userSymbol;
  if (userSymbol === expected) return `- userSymbol: ${userSymbol}`;
  return (
    `- userSymbol: ${userSymbol ?? "(not set)"} ` +
    `(expected \`${expected}\` — generated code references \`${expected}.GassmaClient\`)`
  );
};

const buildVersionLine = (library: AppsscriptLibrary): string => {
  const expected = GASSMA_LIBRARY.version;
  const shown = library.version ?? "(not set)";
  if (library.developmentMode === true) {
    return `- version: ${shown} (ignored — developmentMode is true, so the library HEAD is used)`;
  }
  if (library.version === expected) return `- version: ${shown}`;
  return (
    `- version: ${shown} ` +
    `(expected \`${expected}\` — this CLI targets library v${expected}; other versions can fail at runtime)`
  );
};

const buildLibraryLines = (
  library: AppsscriptLibrary | undefined,
): string[] => {
  if (library === undefined) {
    return ["Gassma library: not found in dependencies.libraries"];
  }
  return [
    "Gassma library: found",
    buildUserSymbolLine(library.userSymbol),
    buildVersionLine(library),
    `- developmentMode: ${
      library.developmentMode === undefined
        ? "(not set)"
        : String(library.developmentMode)
    }`,
  ];
};

const buildAppsscriptLines = (
  status: AppsscriptStatus,
  cwd: string,
  styler: Styler,
): string[] => {
  const heading = styler.heading("-- appsscript.json --");
  const rel = (filePath: string): string => path.relative(cwd, filePath);

  if (status.kind === "notFound") {
    return [
      heading,
      `Not found (searched: ${status.searched.map(rel).join(", ")})`,
    ];
  }
  if (status.kind === "parseError") {
    return [
      heading,
      `Path: ${rel(status.manifestPath)}`,
      "Could not parse appsscript.json",
    ];
  }
  return [
    heading,
    `Path: ${rel(status.manifestPath)}`,
    buildRuntimeVersionLine(status.runtimeVersion),
    ...buildLibraryLines(status.library),
  ];
};

export { buildAppsscriptLines, collectAppsscriptStatus };
export type { AppsscriptStatus };
