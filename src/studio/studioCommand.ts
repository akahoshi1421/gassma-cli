import { openBrowser } from "./openBrowser";
import { resolveStudioUrl } from "./resolveStudioUrl";

const studioCommand = async (): Promise<void> => {
  const url = resolveStudioUrl();
  console.log(`🚀 Opening ${url}`);
  await openBrowser(url);
};

export { studioCommand };
