import type { ExecFn } from "./execCommand";

const checkClaspAvailable = async (exec: ExecFn): Promise<boolean> => {
  const result = await exec("clasp", ["--version"]);
  return result.ok;
};

export { checkClaspAvailable };
