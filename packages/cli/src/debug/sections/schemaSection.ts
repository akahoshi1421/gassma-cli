import path from "path";
import { filterOutputFiles } from "../../config/filterOutputFiles";
import { resolveSchemaFiles } from "../../config/resolveSchemaFiles";
import type { SchemaFile } from "../../config/resolveSchemaFiles";
import { deriveSchemaName, findBaseDir } from "../../generate/generate";
import { mergeSchemaFiles } from "../../generate/mergeSchemaFiles";
import { extractPreviewFeatures } from "../../generate/read/extractPreviewFeatures";
import type { Styler } from "../styles";
import { firstLine } from "../util/firstLine";

type SchemaStatus =
  | {
      kind: "found";
      files: SchemaFile[];
      baseDir: string;
      schemaName: string;
      mergedText: string;
      previewFeatures: string[];
    }
  | { kind: "error"; message: string };

const safeExtractPreviewFeatures = (mergedText: string): string[] => {
  try {
    return extractPreviewFeatures(mergedText);
  } catch {
    return [];
  }
};

const safeFilterOutputFiles = (
  allFiles: SchemaFile[],
  baseDir: string,
): SchemaFile[] => {
  try {
    return filterOutputFiles(allFiles, baseDir);
  } catch {
    return allFiles;
  }
};

const collectSchemaStatus = (options: {
  schema?: string;
  config?: string;
}): SchemaStatus => {
  try {
    const allFiles = resolveSchemaFiles(options);
    const baseDir = findBaseDir(allFiles.map((f) => f.filePath));
    const files = safeFilterOutputFiles(allFiles, baseDir);
    const mergedText = mergeSchemaFiles(files.map((f) => f.filePath));
    return {
      kind: "found",
      files,
      baseDir,
      schemaName: deriveSchemaName(baseDir, files),
      mergedText,
      previewFeatures: safeExtractPreviewFeatures(mergedText),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { kind: "error", message: firstLine(message) };
  }
};

const buildPreviewFeaturesLine = (
  previewFeatures: string[],
  styler: Styler,
): string => {
  if (previewFeatures.length === 0) {
    return styler.dim("Preview features: (none)");
  }
  return `Preview features: ${previewFeatures.join(", ")}`;
};

const buildSchemaLines = (status: SchemaStatus, styler: Styler): string[] => {
  const heading = styler.heading("-- Gassma schema --");
  if (status.kind === "error") {
    return [heading, `Could not resolve schema: ${status.message}`];
  }
  return [
    heading,
    ...status.files.map((f) => `Path: ${path.resolve(f.filePath)}`),
    buildPreviewFeaturesLine(status.previewFeatures, styler),
  ];
};

export { buildSchemaLines, collectSchemaStatus };
export type { SchemaStatus };
