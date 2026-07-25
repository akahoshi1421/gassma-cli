import path from "path";
import type { SchemaFile } from "../../config/resolveSchemaFiles";
import { extractOutputPath } from "../../generate/read/extractOutputPath";
import type { DebugFs } from "../env/debugFs";
import type { Styler } from "../styles";
import type { SchemaStatus } from "./schemaSection";

type GeneratedClientStatus =
  | { kind: "skipped" }
  | { kind: "noOutput" }
  | {
      kind: "resolved";
      outputDir: string;
      jsName: string;
      dtsName: string;
      jsExists: boolean;
      dtsExists: boolean;
      stale: boolean | undefined;
    };

type GeneratedClientDeps = {
  fs: DebugFs;
  cwd: string;
};

const safeExtractOutputPath = (mergedText: string): string | null => {
  try {
    return extractOutputPath(mergedText);
  } catch {
    return null;
  }
};

const collectMtimes = (fs: DebugFs, filePaths: string[]): number[] =>
  filePaths
    .map((filePath) => fs.mtimeMs(filePath))
    .filter((mtime): mtime is number => mtime !== undefined);

const computeStale = (
  fs: DebugFs,
  schemaFiles: SchemaFile[],
  generatedPaths: string[],
  bothExist: boolean,
): boolean | undefined => {
  if (!bothExist) return undefined;
  const schemaTimes = collectMtimes(
    fs,
    schemaFiles.map((f) => path.resolve(f.filePath)),
  );
  const generatedTimes = collectMtimes(fs, generatedPaths);
  if (schemaTimes.length === 0 || generatedTimes.length === 0) return undefined;
  return Math.max(...schemaTimes) > Math.min(...generatedTimes);
};

const collectGeneratedClientStatus = (
  deps: GeneratedClientDeps,
  schemaStatus: SchemaStatus,
): GeneratedClientStatus => {
  if (schemaStatus.kind !== "found") return { kind: "skipped" };

  const outputPath = safeExtractOutputPath(schemaStatus.mergedText);
  if (outputPath === null) return { kind: "noOutput" };

  const outputDir = path.resolve(deps.cwd, outputPath);
  const schemaName = schemaStatus.schemaName;
  const baseName = schemaName.charAt(0).toLowerCase() + schemaName.slice(1);
  const jsName = `${baseName}Client.js`;
  const dtsName = `${baseName}Client.d.ts`;
  const jsPath = path.join(outputDir, jsName);
  const dtsPath = path.join(outputDir, dtsName);
  const jsExists = deps.fs.exists(jsPath);
  const dtsExists = deps.fs.exists(dtsPath);

  return {
    kind: "resolved",
    outputDir,
    jsName,
    dtsName,
    jsExists,
    dtsExists,
    stale: computeStale(
      deps.fs,
      schemaStatus.files,
      [jsPath, dtsPath],
      jsExists && dtsExists,
    ),
  };
};

const buildStatusLine = (stale: boolean | undefined): string[] => {
  if (stale === undefined) return [];
  if (stale) {
    return [
      "Status: possibly stale (schema is newer than the generated client — run `gassma generate`)",
    ];
  }
  return ["Status: up to date"];
};

const buildGeneratedClientLines = (
  status: GeneratedClientStatus,
  cwd: string,
  styler: Styler,
): string[] => {
  const heading = styler.heading("-- Generated client --");
  if (status.kind === "skipped") return [heading, "Skipped (schema not found)"];
  if (status.kind === "noOutput") {
    return [heading, "Output path not found in the generator block"];
  }
  const relOutput = path.relative(cwd, status.outputDir);
  return [
    heading,
    `Output: ${relOutput === "" ? "." : relOutput}`,
    `${status.jsName}: ${status.jsExists ? "found" : "not found"}`,
    `${status.dtsName}: ${status.dtsExists ? "found" : "not found"}`,
    ...buildStatusLine(status.stale),
  ];
};

export { buildGeneratedClientLines, collectGeneratedClientStatus };
export type { GeneratedClientStatus };
