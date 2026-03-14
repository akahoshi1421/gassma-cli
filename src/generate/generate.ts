import fs from "fs";
import path from "path";
import { generater } from "./generator";
import { generateClientDts } from "./jsGenerate/generateClientDts";
import { generateClientJs } from "./jsGenerate/generateClientJs";
import { extractOutputPath } from "./read/extractOutputPath";
import { extractAutoincrement } from "./read/extractAutoincrement";
import { extractDefaults } from "./read/extractDefaults";
import { extractRelations } from "./read/extractRelations";
import { extractUpdatedAt } from "./read/extractUpdatedAt";
import { extractIgnore } from "./read/extractIgnore";
import { extractIgnoreSheets } from "./read/extractIgnoreSheets";
import { extractMap } from "./read/extractMap";
import { extractMapSheets } from "./read/extractMapSheets";
import { extractEnums } from "./read/extractEnums";
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
    const autoincrement = extractAutoincrement(schemaText);
    const defaults = extractDefaults(schemaText);
    const updatedAt = extractUpdatedAt(schemaText);
    const ignore = extractIgnore(schemaText);
    const ignoreSheets = extractIgnoreSheets(schemaText);
    const map = extractMap(schemaText);
    const mapSheets = extractMapSheets(schemaText);
    const enums = extractEnums(schemaText);
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
      Object.keys(autoincrement),
    );
    writer(resultString, baseName, outputPath);
    const clientJs = generateClientJs(
      relations,
      schemaName,
      defaults,
      updatedAt,
      ignore,
      map,
      ignoreSheets,
      mapSheets,
      autoincrement,
      enums,
    );
    jsWriter(clientJs, `${baseName}Client`, outputPath);
    const clientDts = generateClientDts(schemaName, enums);
    writer(clientDts, `${baseName}Client`, outputPath);
  });

  console.log(`✅ Generated ${prismaFiles.length} type definition file(s)`);
}

export { generate };
