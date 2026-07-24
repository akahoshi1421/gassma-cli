import fs from "fs";
import path from "path";
import type { Plugin } from "esbuild";
import { collectExportNames } from "./collectExportNames";
import { GAS_BUNDLE_GLOBAL_NAME, PLUGIN_NAME } from "./constants";
import { generateStubs } from "./generateStubs";

const gasEsbuildPlugin = (): Plugin => ({
  name: PLUGIN_NAME,
  setup(build) {
    const options = build.initialOptions;
    const outfile = options.outfile;

    if (outfile === undefined) {
      throw new Error(
        `${PLUGIN_NAME}: the esbuild "outfile" option is required. ` +
          'GAS expects a single bundled file, so "outdir" is not supported.',
      );
    }
    if (options.write === false) {
      throw new Error(
        `${PLUGIN_NAME}: "write: false" is not supported because this plugin ` +
          'rewrites the file written to "outfile".',
      );
    }

    // GAS only recognizes top-level function declarations, so the bundle
    // itself is kept inside an internal iife global and top-level stubs that
    // delegate to it are prepended afterwards.
    options.format = "iife";
    options.globalName = GAS_BUNDLE_GLOBAL_NAME;

    const outfilePath = path.resolve(
      options.absWorkingDir ?? process.cwd(),
      outfile,
    );

    build.onEnd(async (result) => {
      if (result.errors.length > 0) return;

      const exportNames = await collectExportNames(build);
      const stubs = generateStubs(exportNames, GAS_BUNDLE_GLOBAL_NAME);
      if (stubs === "") return;

      const bundled = await fs.promises.readFile(outfilePath, "utf8");
      await fs.promises.writeFile(outfilePath, `${stubs}\n${bundled}`);
    });
  },
});

export { gasEsbuildPlugin };
