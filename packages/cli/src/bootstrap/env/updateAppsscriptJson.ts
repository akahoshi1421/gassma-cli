import { applyAppsscriptEdits } from "../generators/applyAppsscriptEdits";
import type { FileStore } from "./fileStore";

type UpdateAppsscriptJsonOptions = {
  store: FileStore;
  manifestPath: string;
  timeZone: string;
};

const readManifest = (store: FileStore, manifestPath: string): unknown => {
  if (!store.exists(manifestPath)) return {};
  try {
    return JSON.parse(store.read(manifestPath));
  } catch {
    return {};
  }
};

const updateAppsscriptJson = (options: UpdateAppsscriptJsonOptions): void => {
  const manifest = readManifest(options.store, options.manifestPath);
  const updated = applyAppsscriptEdits(manifest, {
    timeZone: options.timeZone,
  });

  options.store.write(
    options.manifestPath,
    `${JSON.stringify(updated, null, 2)}\n`,
  );
};

export { updateAppsscriptJson };
