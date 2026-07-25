import type { FunctionStyle } from "../functionStyle";

const PLUGIN_IMPORTS = {
  export: 'import { gasEsbuildPlugin } from "@gassma/gas-esbuild-plugin";',
  global: 'import { GasPlugin } from "esbuild-gas-plugin";',
};

const PLUGIN_USAGES = {
  export: "gasEsbuildPlugin()",
  global: "GasPlugin",
};

const generateEsbuildConfig = (
  style: FunctionStyle,
): string => `import esbuild from "esbuild";
${PLUGIN_IMPORTS[style]}

esbuild
  .build({
    entryPoints: ["./src/index.ts"],
    bundle: true,
    minify: true,
    outfile: "./dist/index.js",
    plugins: [${PLUGIN_USAGES[style]}],
  })
  .catch((error) => {
    console.error("Build failed.");
    console.error(error);
    process.exit(1);
  });
`;

export { generateEsbuildConfig };
