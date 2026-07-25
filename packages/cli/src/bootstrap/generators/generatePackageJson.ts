import type { FunctionStyle } from "../functionStyle";

type GeneratePackageJsonOptions = {
  name: string;
  gassmaVersion: string;
  style: FunctionStyle;
};

const buildDevDependencies = (style: FunctionStyle): Record<string, string> => {
  if (style === "export") {
    return {
      "@gassma/gas-esbuild-plugin": "^0.1.0",
      "@types/google-apps-script": "^2.0.11",
      esbuild: "^0.28.0",
      typescript: "^6.0.3",
    };
  }
  return {
    "@types/google-apps-script": "^2.0.11",
    esbuild: "^0.28.0",
    "esbuild-gas-plugin": "^0.10.0",
    typescript: "^6.0.3",
  };
};

const buildPackageJsonObject = (options: GeneratePackageJsonOptions) => ({
  name: options.name,
  version: "1.0.0",
  type: "commonjs",
  scripts: {
    build: "node esbuild.mjs",
    push: "clasp push",
    open: "clasp open",
    deploy: "npm run build && npm run push",
  },
  dependencies: { gassma: `^${options.gassmaVersion}` },
  devDependencies: buildDevDependencies(options.style),
});

const generatePackageJson = (options: GeneratePackageJsonOptions): string =>
  `${JSON.stringify(buildPackageJsonObject(options), null, 2)}\n`;

export { buildPackageJsonObject, generatePackageJson };
export type { GeneratePackageJsonOptions };
