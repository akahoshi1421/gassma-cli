import type { ExecFn, ExecResult } from "./execCommand";

type ClaspCreateOptions = {
  title: string;
  withSheets: boolean;
  rootDir: string;
  cwd?: string;
};

const runClaspCreate = (
  exec: ExecFn,
  options: ClaspCreateOptions,
): Promise<ExecResult> => {
  const type = options.withSheets ? "sheets" : "standalone";

  return exec(
    "clasp",
    [
      "create-script",
      "--type",
      type,
      "--title",
      options.title,
      "--rootDir",
      options.rootDir,
    ],
    { cwd: options.cwd, inherit: true },
  );
};

export { runClaspCreate };
export type { ClaspCreateOptions };
