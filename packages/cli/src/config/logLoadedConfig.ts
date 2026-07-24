import path from "path";

const logLoadedConfig = (filePath: string | undefined): void => {
  if (filePath === undefined) return;
  const relativePath = path.relative(process.cwd(), filePath);
  console.log(`⚙️ Loaded config from ${relativePath}`);
};

export { logLoadedConfig };
