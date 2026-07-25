import path from "path";
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

const manifestStep: BootstrapStep = {
  id: "manifest",
  run: async (context, deps) => {
    const libraryVersion = await fetchLatestLibraryVersion(deps.exec);
    const timeZone = resolveTimeZone();

    updateAppsscriptJson({
      store: deps.store,
      manifestPath: path.join(context.cwd, "dist", "appsscript.json"),
      timeZone,
      libraryVersion,
    });

    deps.prompter.info(
      `Updated dist/appsscript.json (timeZone: ${timeZone}, Gassma library version ${libraryVersion}).`,
    );
    return { ...context, libraryVersion };
  },
};

export { claspCreateStep, manifestStep };
