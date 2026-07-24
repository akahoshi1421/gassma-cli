import type { Metafile, PluginBuild } from "esbuild";
import { PLUGIN_NAME } from "./constants";

const findEntryExports = (metafile: Metafile): string[] => {
  const outputs = metafile.outputs;
  const entryKey = Object.keys(outputs).find(
    (key) => outputs[key].entryPoint !== undefined,
  );

  if (entryKey === undefined) {
    throw new Error(
      `${PLUGIN_NAME}: could not find the entry point output in the metafile of the analysis build.`,
    );
  }

  return outputs[entryKey].exports;
};

// With format "iife" the metafile "exports" array is always empty because
// iife output has no concept of exports. So the same build is run once more
// in memory with format "esm" only to collect the export names.
const collectExportNames = async (
  pluginBuild: PluginBuild,
): Promise<string[]> => {
  // Carrying over "plugins" would run this plugin again and rebuild forever,
  // and "globalName" is meaningless for the esm analysis build.
  const {
    plugins: _plugins,
    globalName: _globalName,
    ...carriedOptions
  } = pluginBuild.initialOptions;

  const result = await pluginBuild.esbuild.build({
    ...carriedOptions,
    format: "esm",
    write: false,
    metafile: true,
    sourcemap: false,
    logLevel: "silent",
  });

  const metafile: Metafile | undefined = result.metafile;
  if (metafile === undefined) {
    throw new Error(
      `${PLUGIN_NAME}: the analysis build did not generate a metafile.`,
    );
  }

  return findEntryExports(metafile);
};

export { collectExportNames };
