import fs from "fs";
import path from "path";
import { extractOutputPath } from "../generate/read/extractOutputPath";
import type { SchemaFile } from "./resolveSchemaFiles";

const filterOutputFiles = (
  files: SchemaFile[],
  baseDir: string,
): SchemaFile[] => {
  const outputPaths = files
    .map((f) => {
      const content = fs.readFileSync(f.filePath, "utf-8");
      return extractOutputPath(content);
    })
    .filter((p): p is string => p !== null);

  if (outputPaths.length === 0) return files;

  const resolvedOutputDirs = outputPaths.map((p) => path.resolve(baseDir, p));

  return files.filter((f) => {
    const resolved = path.resolve(f.filePath);
    return resolvedOutputDirs.every(
      (outDir) => !resolved.startsWith(outDir + path.sep),
    );
  });
};

export { filterOutputFiles };
