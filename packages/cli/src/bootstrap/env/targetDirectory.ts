import fs from "fs";
import path from "path";

type DirectoryStatus = "missing" | "file" | "empty" | "nonEmpty";

type DirectoryOps = {
  inspect: (dirPath: string) => DirectoryStatus;
  ensure: (dirPath: string) => void;
  changeTo: (dirPath: string) => void;
};

const resolveTargetDirectory = (cwd: string, input: string): string => {
  const trimmed = input.trim();
  return path.resolve(cwd, trimmed === "" ? "." : trimmed);
};

const inspectDirectory = (dirPath: string): DirectoryStatus => {
  if (!fs.existsSync(dirPath)) return "missing";
  if (!fs.statSync(dirPath).isDirectory()) return "file";
  return fs.readdirSync(dirPath).length === 0 ? "empty" : "nonEmpty";
};

const createDirectoryOps = (): DirectoryOps => ({
  inspect: inspectDirectory,
  ensure: (dirPath) => {
    fs.mkdirSync(dirPath, { recursive: true });
  },
  changeTo: (dirPath) => {
    process.chdir(dirPath);
  },
});

export { createDirectoryOps, inspectDirectory, resolveTargetDirectory };
export type { DirectoryOps, DirectoryStatus };
