import fs from "fs";
import path from "path";

const CONFIG_EXTENSIONS = [".js", ".ts", ".mjs", ".cjs", ".mts", ".cts"];

const buildCandidates = (cwd: string): string[] => {
  const rootCandidates = CONFIG_EXTENSIONS.map((ext) =>
    path.resolve(cwd, `gassma.config${ext}`),
  );
  const dotConfigCandidates = CONFIG_EXTENSIONS.map((ext) =>
    path.resolve(cwd, ".config", `gassma${ext}`),
  );

  return [...rootCandidates, ...dotConfigCandidates];
};

const findConfigFile = (cwd: string): string | undefined =>
  buildCandidates(cwd).find((candidate) => fs.existsSync(candidate));

export { findConfigFile };
