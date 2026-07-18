import { spawn } from "child_process";
import { getOpenCommand } from "./getOpenCommand";

const openBrowser = (url: string): void => {
  const { command, args } = getOpenCommand(process.platform, url);
  const child = spawn(command, args, { detached: true, stdio: "ignore" });
  child.unref();
};

export { openBrowser };
