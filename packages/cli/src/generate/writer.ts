import fs from "fs";
import path from "path";

const writer = (
  resultTypeString: string,
  fileName: string,
  outputDir: string,
) => {
  const targetPath = path.join(outputDir, `${fileName}.d.ts`);

  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(targetPath, resultTypeString);
  console.log(`✅ Generated: ${targetPath}`);
};

export { writer };
