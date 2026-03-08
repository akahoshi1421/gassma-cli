import fs from "fs";
import path from "path";
import { generater } from "./generator";
import { generateClientJs } from "./jsGenerate/generateClientJs";
import { extractOutputPath } from "./read/extractOutputPath";
import { extractRelations } from "./read/extractRelations";
import { prismaReader } from "./read/prismaReader";
import { writer } from "./writer";
import { jsWriter } from "./jsWriter";

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

    const outputPath = extractOutputPath(schemaText);
    if (!outputPath)
      throw new Error(
        `No output path found in ${file}. Please add 'output' to the generator block.\n` +
          `Example:\n  generator client {\n    provider = "prisma-client-js"\n    output   = "./generated/gassma"\n  }`,
      );

    const parsed = prismaReader(schemaText);
    const relations = extractRelations(schemaText);
    const resultString = generater(parsed, relations);
    const baseName = path.basename(file, ".prisma");
    writer(resultString, baseName, outputPath);
    const clientJs = generateClientJs(relations);
    jsWriter(clientJs, "client", outputPath);
  });

  console.log(`✅ Generated ${prismaFiles.length} type definition file(s)`);
}

export { generate };
