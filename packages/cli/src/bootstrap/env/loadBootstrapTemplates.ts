import { readTemplate } from "../../util/readTemplate";
import type { FunctionStyle } from "../functionStyle";

type BootstrapTemplates = {
  gitignore: string;
  agentsMd: string;
  tsconfig: string;
  packageJson: string;
  esbuild: Record<FunctionStyle, string>;
  sampleIndex: Record<FunctionStyle, string>;
};

const loadBootstrapTemplates = (
  startDir: string = __dirname,
): BootstrapTemplates => ({
  gitignore: readTemplate(".gitignore.template", startDir),
  agentsMd: readTemplate("AGENTS.md.template", startDir),
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

export { loadBootstrapTemplates };
export type { BootstrapTemplates };
