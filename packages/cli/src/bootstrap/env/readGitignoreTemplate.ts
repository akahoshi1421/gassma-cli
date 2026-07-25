import fs from "fs";
import path from "path";
import { findPackageRoot } from "../../util/findPackageRoot";

const readGitignoreTemplate = (startDir: string = __dirname): string => {
  const packageRoot = findPackageRoot(startDir);
  if (packageRoot === undefined) {
    throw new Error(
      `Could not find the gassma package root above ${startDir}. The CLI installation looks broken.`,
    );
  }

  const templatePath = path.join(
    packageRoot.dir,
    "templates",
    ".gitignore.example",
  );
  if (!fs.existsSync(templatePath)) {
    throw new Error(
      `Could not find the bundled template ${templatePath}. The CLI installation looks broken.`,
    );
  }

  return fs.readFileSync(templatePath, "utf-8");
};

export { readGitignoreTemplate };
