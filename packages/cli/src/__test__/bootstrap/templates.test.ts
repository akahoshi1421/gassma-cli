import { describe, expect, it } from "vitest";
import { readTemplate } from "../../bootstrap/env/readTemplate";

const GITIGNORE = [
  ".clasp.json",
  ".clasprc.json",
  ".env",
  "node_modules/",
  "dist/*",
  "!dist/appsscript.json",
  "",
].join("\n");

const TSCONFIG = `{
  "compilerOptions": {
    "lib": [
      "esnext"
    ],
    "types": [
      "google-apps-script"
    ]
  },
  "include": [
    "./src"
  ]
}
`;

const PACKAGE_JSON = `{
  "name": "",
  "version": "1.0.0",
  "type": "commonjs",
  "scripts": {
    "build": "node esbuild.mjs",
    "push": "clasp push",
    "open": "clasp open",
    "deploy": "npm run build && npm run push"
  },
  "dependencies": {
    "gassma": ""
  },
  "devDependencies": {
    "@gassma/gas-esbuild-plugin": "^0.1.0",
    "@types/google-apps-script": "^2.0.11",
    "esbuild": "^0.28.0",
    "esbuild-gas-plugin": "^0.10.0",
    "typescript": "^6.0.3"
  }
}
`;

const buildEsbuild = (
  importLine: string,
  usage: string,
) => `import esbuild from "esbuild";
${importLine}

esbuild
  .build({
    entryPoints: ["./src/index.ts"],
    bundle: true,
    minify: true,
    outfile: "./dist/index.js",
    plugins: [${usage}],
  })
  .catch((error) => {
    console.error("Build failed.");
    console.error(error);
    process.exit(1);
  });
`;

const ESBUILD_EXPORT = buildEsbuild(
  'import { gasEsbuildPlugin } from "@gassma/gas-esbuild-plugin";',
  "gasEsbuildPlugin()",
);

const ESBUILD_GLOBAL = buildEsbuild(
  'import { GasPlugin } from "esbuild-gas-plugin";',
  "GasPlugin",
);

const INDEX_EXPORT = `export const main = () => console.log("Hello GAS!");\n`;

const INDEX_GLOBAL = `const main = () => console.log("Hello GAS!");

interface Global {
  main: typeof main;
}

declare const global: Global;

global.main = main;
`;

describe("bundled templates", () => {
  it("should ship .gitignore.template byte for byte", () => {
    expect(readTemplate(".gitignore.template")).toBe(GITIGNORE);
  });

  it("should ship tsconfig.json.template byte for byte", () => {
    expect(readTemplate("tsconfig.json.template")).toBe(TSCONFIG);
  });

  it("should ship package.json.template byte for byte", () => {
    expect(readTemplate("package.json.template")).toBe(PACKAGE_JSON);
  });

  it("should ship esbuild.export.mjs.template byte for byte", () => {
    expect(readTemplate("esbuild.export.mjs.template")).toBe(ESBUILD_EXPORT);
  });

  it("should ship esbuild.global.mjs.template byte for byte", () => {
    expect(readTemplate("esbuild.global.mjs.template")).toBe(ESBUILD_GLOBAL);
  });

  it("should ship index.export.ts.template byte for byte", () => {
    expect(readTemplate("index.export.ts.template")).toBe(INDEX_EXPORT);
  });

  it("should ship index.global.ts.template byte for byte", () => {
    expect(readTemplate("index.global.ts.template")).toBe(INDEX_GLOBAL);
  });
});
