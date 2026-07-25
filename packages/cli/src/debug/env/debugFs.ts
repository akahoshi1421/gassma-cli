import fs from "fs";

type DebugFs = {
  exists: (filePath: string) => boolean;
  readText: (filePath: string) => string;
  mtimeMs: (filePath: string) => number | undefined;
};

const createDebugFs = (): DebugFs => ({
  exists: (filePath) => fs.existsSync(filePath),
  readText: (filePath) => fs.readFileSync(filePath, "utf-8"),
  mtimeMs: (filePath) => {
    try {
      return fs.statSync(filePath).mtimeMs;
    } catch {
      return undefined;
    }
  },
});

export { createDebugFs };
export type { DebugFs };
