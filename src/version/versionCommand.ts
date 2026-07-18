import { formatVersionOutput } from "./formatVersionOutput";
import { getVersion } from "./getVersion";

type VersionOptions = {
  json?: boolean;
};

const versionCommand = (options?: VersionOptions): void => {
  console.log(formatVersionOutput(getVersion(), options?.json === true));
};

export { versionCommand };
export type { VersionOptions };
