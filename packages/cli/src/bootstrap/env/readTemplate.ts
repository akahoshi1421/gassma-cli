import fs from "fs";
import path from "path";
import { findPackageRoot } from "../../util/findPackageRoot";
import type { FunctionStyle } from "../functionStyle";

type BootstrapTemplates = {
  gitignore: string;
  tsconfig: string;
  packageJson: string;
  esbuild: Record<FunctionStyle, string>;
  sampleIndex: Record<FunctionStyle, string>;
};

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

const loadBootstrapTemplates = (
  startDir: string = __dirname,
): BootstrapTemplates => ({
  gitignore: readTemplate(".gitignore.template", startDir),
  tsconfig: readTemplate("tsconfig.json.template", startDir),
  packageJson: readTemplate("package.json.template", startDir),
  esbuild: {
    export: readTemplate("esbuild.export.mjs.template", startDir),
    global: readTemplate("esbuild.global.mjs.template", startDir),
  },
  sampleIndex: {
    export: readTemplate("index.export.ts.template", startDir),
    global: readTemplate("index.global.ts.template", startDir),
  },
});

export { loadBootstrapTemplates, readTemplate };
export type { BootstrapTemplates };
