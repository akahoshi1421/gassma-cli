import path from "path";
import fs from "fs";

const getVersion = (): string => {
  const packageJsonPath = path.resolve(__dirname, "../../package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  return packageJson.version;
};

export { getVersion };
