import fs from "fs";
import path from "path";
import { generater } from "./generator";
import { prismaReader } from "./read/prismaReader";
import { writer } from "./writer";

function generate(customDir?: string) {
  const gassmaDir = customDir || "./gassma";

  if (!fs.existsSync(gassmaDir))
    throw new Error(
      `${gassmaDir}/ directory not found. Please create ${gassmaDir}/ directory with .prisma files.`,
    );

  const prismaFiles = fs
    .readdirSync(gassmaDir)
    .filter((file) => file.endsWith(".prisma"));

  if (prismaFiles.length === 0)
    throw new Error(
      `No .prisma files found in ${gassmaDir}/ directory. Please create at least one .prisma file.`,
    );

  console.log(
    `📁 Found ${prismaFiles.length} .prisma file(s) in ${path.basename(gassmaDir)} directory`,
  );

  prismaFiles.forEach((file) => {
    const filePath = path.join(gassmaDir, file);
    console.log(`  📄 Processing: ${file}`);

    const schemaText = fs.readFileSync(filePath, "utf-8");
    const parsed = prismaReader(schemaText);
    const resultString = generater(parsed);
    const baseName = path.basename(file, ".prisma");
    writer(resultString, baseName);
  });

  console.log(`✅ Generated ${prismaFiles.length} type definition file(s)`);
}

export { generate };
