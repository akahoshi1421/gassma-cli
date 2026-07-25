import { findPackageRoot } from "../util/findPackageRoot";

const findGassmaVersion = (startDir: string): string => {
  const packageRoot = findPackageRoot(startDir);
  if (packageRoot === undefined) {
    throw new Error(
      `Could not find the gassma package.json above ${startDir}. The CLI installation looks broken.`,
    );
  }
  return packageRoot.version;
};

const getVersion = (): string => findGassmaVersion(__dirname);

export { findGassmaVersion, getVersion };
