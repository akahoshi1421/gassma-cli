import fs from "fs";
import path from "path";
import { findPackageRoot } from "./findPackageRoot";

const readTemplate = (name: string, startDir: string = __dirname): string => {
  const packageRoot = findPackageRoot(startDir);
  if (packageRoot === undefined) {
    throw new Error(
      `Could not find the gassma package root above ${startDir}. The CLI installation looks broken.`,
    );
  }

  const templatePath = path.join(packageRoot.dir, "templates", name);
  if (!fs.existsSync(templatePath)) {
    throw new Error(
      `Could not find the bundled template ${templatePath}. The CLI installation looks broken.`,
    );
  }

  return fs.readFileSync(templatePath, "utf-8");
};

export { readTemplate };
