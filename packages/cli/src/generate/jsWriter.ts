import fs from "fs";
import path from "path";

const jsWriter = (jsString: string, fileName: string, outputDir: string) => {
  const targetPath = path.join(outputDir, `${fileName}.js`);

  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(targetPath, jsString);
  console.log(`✅ Generated: ${targetPath}`);
};

export { jsWriter };
