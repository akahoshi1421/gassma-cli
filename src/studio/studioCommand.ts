import { openBrowser } from "./openBrowser";
import { resolveStudioUrl } from "./resolveStudioUrl";

const studioCommand = (): void => {
  const url = resolveStudioUrl();
  console.log(`🚀 Opening ${url}`);
  openBrowser(url);
};

export { studioCommand };
