import fs from "fs";
import path from "path";
import { generater } from "./generator";
import { generateClientDts } from "./jsGenerate/generateClientDts";
import { generateClientJs } from "./jsGenerate/generateClientJs";
import { extractOutputPath } from "./read/extractOutputPath";
import { extractDefaults } from "./read/extractDefaults";
import { extractRelations } from "./read/extractRelations";
import { extractUpdatedAt } from "./read/extractUpdatedAt";
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

  const commonWritten = new Set<string>();

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
    const defaults = extractDefaults(schemaText);
    const updatedAt = extractUpdatedAt(schemaText);
    const baseName = path.basename(file, ".prisma");
    const schemaName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
    const includeCommon = !commonWritten.has(outputPath);
    commonWritten.add(outputPath);
    const resultString = generater(
      parsed,
      relations,
      schemaName,
      includeCommon,
      defaults,
      Object.keys(updatedAt),
    );
    writer(resultString, baseName, outputPath);
    const clientJs = generateClientJs(
      relations,
      schemaName,
      defaults,
      updatedAt,
    );
    jsWriter(clientJs, `${baseName}Client`, outputPath);
    const clientDts = generateClientDts(schemaName);
    writer(clientDts, `${baseName}Client`, outputPath);
  });

  console.log(`✅ Generated ${prismaFiles.length} type definition file(s)`);
}

export { generate };
