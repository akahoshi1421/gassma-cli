import { openBrowser } from "./openBrowser";
import { resolveStudioUrl } from "./resolveStudioUrl";
import type { StudioUrlOptions } from "./resolveStudioUrl";

const studioCommand = async (options?: StudioUrlOptions): Promise<void> => {
  const url = resolveStudioUrl(options);
  console.log(`🚀 Opening ${url}`);
  await openBrowser(url);
};

export { studioCommand };
