import path from "path";
import { GASSMA_LIBRARY } from "../../const/gassmaLibrary";
import { fetchLatestLibraryVersion } from "../../env/fetchLatestLibraryVersion";
import { runClaspCreate } from "../../env/runClaspCreate";
import { updateAppsscriptJson } from "../../env/updateAppsscriptJson";
import { resolveTimeZone } from "../../generators/resolveTimeZone";
import type { BootstrapStep } from "../context";

const claspCreateStep: BootstrapStep = {
  id: "claspCreate",
  run: async (context, deps) => {
    if (context.claspCreateSkipped) return context;

    deps.prompter.info(
      `Creating a new Apps Script project "${context.title}"...`,
    );
    const result = await runClaspCreate(deps.exec, {
      title: context.title,
      withSheets: context.withSheets,
      rootDir: "./dist",
      cwd: context.cwd,
    });

    if (!result.ok) {
      const detail = result.stderr.trim();
      throw new Error(
        `clasp create-script failed.${detail === "" ? "" : ` ${detail}`}`,
      );
    }
    return context;
  },
};

const UNRESOLVED_VERSION_WARNING = [
  "Could not resolve the latest Gassma library version (clasp and GitHub were both unreachable).",
  "Skipped adding the Gassma library to dist/appsscript.json.",
  "Add it manually in the Apps Script editor (Libraries > Add a library):",
  `  Script ID: ${GASSMA_LIBRARY.scriptId}`,
  'The latest version is the "version" field of package.json at https://github.com/akahoshi1421/gassma.',
  "Re-running gassma bootstrap while online will add the entry automatically.",
].join("\n");

const describeManifestUpdate = (
  timeZone: string,
  libraryVersion: string | null,
  dryRun: boolean,
): string => {
  if (dryRun) {
    return `Updated dist/appsscript.json (timeZone: ${timeZone}, Gassma library version: latest, resolved at run time).`;
  }
  if (libraryVersion === null) {
    return `Updated dist/appsscript.json (timeZone: ${timeZone}) without the Gassma library entry.`;
  }
  return `Updated dist/appsscript.json (timeZone: ${timeZone}, Gassma library version ${libraryVersion}).`;
};

const manifestStep: BootstrapStep = {
  id: "manifest",
  run: async (context, deps) => {
    const libraryVersion = await fetchLatestLibraryVersion(
      deps.exec,
      deps.fetchText,
    );
    const timeZone = resolveTimeZone();

    updateAppsscriptJson({
      store: deps.store,
      manifestPath: path.join(context.cwd, "dist", "appsscript.json"),
      timeZone,
      libraryVersion,
    });

    if (!deps.dryRun && libraryVersion === null) {
      deps.prompter.warn(UNRESOLVED_VERSION_WARNING);
    }
    deps.prompter.info(
      describeManifestUpdate(timeZone, libraryVersion, deps.dryRun),
    );
    return { ...context, libraryVersion };
  },
};

export { claspCreateStep, manifestStep };
